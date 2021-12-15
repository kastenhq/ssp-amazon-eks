# AWS for Fluent Bit

Fluent Bit is an open source Log Processor and Forwarder which allows you to collect any data like metrics and logs from different sources, enrich them with filters and send them to multiple destinations.

AWS provides a Fluent Bit image with plugins for both CloudWatch Logs and Kinesis Data Firehose. The [AWS for Fluent Bit image](https://gallery.ecr.aws/aws-observability/aws-for-fluent-bit) is available on the Amazon ECR Public Gallery. For more details, see [AWS for Fluent Bit GitHub repository](https://github.com/aws/aws-for-fluent-bit).

## Usage

```typescript
import * as ssp from '@aws-quickstart/ssp-amazon-eks';

const awsForFluentBit = new ssp.addons.AwsForFluentBitAddOn();
const addOns: Array<ClusterAddOn> = [ awsForFluentBit ];

const app = new cdk.App();
new EksBlueprint(app, 'my-stack-name', addOns, [], {
  env: {
      account: <AWS_ACCOUNT_ID>,
      region: <AWS_REGION>,
  },
});
```