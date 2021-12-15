import { PolicyStatement } from '@aws-cdk/aws-iam';

import { ClusterInfo } from "../../spi/types";
import { ClusterAddOn } from "../../spi/addon-contracts"
import { createNamespace } from "../../utils/namespace-utils";

/**
 * Configuration options for the FluentBit add-on.
 */
export interface AwsForFluentBitAddOnProps {
    /**
    * Name of the helm chart (add-on)
    */
    name?: string,

    /**
     * Namespace
     */
    namespace?: string

    /**
     * Chart name
     */
    chart?: string,

    /**
     * Helm chart version.
     */
    version?: string,

    /**
     * Helm release
     */
    release?: string,

    /**
     * Helm repository
     */
    repository?: string,

    /**
     * Optional values for the helm chart.
     */
    values?: {
        [key: string]: any;
    };

    iamPolicies?: PolicyStatement[]
}

export interface ElasticsearchProps {
    /**
     * The ARN for the Elasticsearch domain.
     */
    readonly domainArn: string

    /**
     * The endpoint for the Elasticsearch domain.
     */
    readonly domainEndpoint: string
}

/**
 * Default props for the add-on.
 */
const defaultProps: AwsForFluentBitAddOnProps = {
    name: 'fluent-bit',
    namespace: 'kube-system',
    chart: 'aws-for-fluent-bit',
    release: 'aws-for-fluent-bit',
    version: '0.1.11',
    repository: 'https://aws.github.io/eks-charts',
    values: {}
}

/**
 * FluentBitAddOn deploys FluentBit into an EKS cluster using the `aws-for-fluent-bit` Helm chart.
 * https://github.com/aws/eks-charts/tree/master/stable/aws-for-fluent-bit
 */
export class AwsForFluentBitAddOn implements ClusterAddOn {

    readonly props: AwsForFluentBitAddOnProps

    constructor(props?: AwsForFluentBitAddOnProps) {
        this.props = { ...defaultProps, ...props }
    }

    deploy(clusterInfo: ClusterInfo): void {
        // Create the FluentBit namespace.
        const cluster = clusterInfo.cluster;
        const namespace = this.props.namespace
        createNamespace(this.props.namespace!, cluster)

        // Create the FluentBut service account.
        const serviceAccountName = 'aws-for-fluent-bit-sa'
        const sa = cluster.addServiceAccount(serviceAccountName, {
            name: serviceAccountName,
            namespace: namespace
        });

        // Apply additional IAM policies to the service account.
        const policies = this.props.iamPolicies || []
        policies.forEach((policy: PolicyStatement) => sa.addToPrincipalPolicy(policy))

        // Configure values.
        const values = {
            serviceAccount: {
                name: serviceAccountName,
                create: false
            },
            ...this.props.values
        }


        // Apply Helm Chart.
        cluster.addHelmChart("fluent-but-addon", {
            chart: this.props.chart!,
            release: this.props.release,
            repository: this.props.repository,
            namespace,
            version: this.props.version,
            values
        });
    }
}
