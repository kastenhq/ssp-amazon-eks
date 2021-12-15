import { PolicyStatement } from '@aws-cdk/aws-iam';
import { Construct } from "@aws-cdk/core";

import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
import { ClusterInfo } from "../../spi/types";
import { createNamespace } from "../../utils/namespace-utils";

/**
 * Configuration options for the FluentBit add-on.
 */
export interface AwsForFluentBitAddOnProps extends HelmAddOnUserProps {
    /**
     * Iam policies for the add-on.
     */
    iamPolicies?: PolicyStatement[]
}
/**
 * Default props for the add-on.
 */
const defaultProps: AwsForFluentBitAddOnProps = {
    name: 'fluent-bit',
    chart: 'aws-for-fluent-bit',
    release: "ssp-addon-aws-for-fluent-bit",
    version: '0.1.11',
    repository: 'https://aws.github.io/eks-charts',
    namespace: 'kube-system',
    values: {}
}

/**
 * AwsForFluentBitAddOn deploys FluentBit into an EKS cluster using the `aws-for-fluent-bit` Helm chart.
 * https://github.com/aws/eks-charts/tree/master/stable/aws-for-fluent-bit
 */
export class AwsForFluentBitAddOn extends HelmAddOn {

    readonly options: AwsForFluentBitAddOnProps

    constructor(props?: AwsForFluentBitAddOnProps) {
        super({ ...defaultProps as any, ...props })
        this.options = this.props
    }

    deploy(clusterInfo: ClusterInfo): Promise<Construct> {
        const cluster = clusterInfo.cluster;

        // Create the FluentBit namespace.
        const namespace = this.options.namespace
        createNamespace(this.options.namespace!, cluster)

        // Create the FluentBut service account.
        const serviceAccountName = 'aws-for-fluent-bit-sa'
        const sa = cluster.addServiceAccount(serviceAccountName, {
            name: serviceAccountName,
            namespace: namespace
        });

        // Apply additional IAM policies to the service account.
        const policies = this.options.iamPolicies || []
        policies.forEach((policy: PolicyStatement) => sa.addToPrincipalPolicy(policy))

        // Configure values.
        const values = {
            serviceAccount: {
                name: serviceAccountName,
                create: false
            },
            ...this.options.values
        }

        const helmChart = this.addHelmChart(clusterInfo, values);
        return Promise.resolve(helmChart);
    }
}
