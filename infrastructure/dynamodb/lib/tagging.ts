import { Construct } from 'constructs';
import * as tag from '@ace-clublabs/aws-tags';
import { addTags } from '@ace-clublabs/aws-cdk-tagging';

export default function tagWrapper(
  resource: Construct,
  region: tag.RegionValue,
  environment: string
) {
  addTags(resource, {
    'ace:region': region as tag.RegionValue,
    'ace:department': tag.DepartmentValue.Ebiz,
    'ace:environment': environment as tag.EnvironmentValue,
    'ace:workload': tag.WorkloadValue.Claims,
    'ace:team': tag.TeamValue.InsuranceSelfService,
    'ace:data-profile': tag.DataProfileValue.Confidential
  });
}
