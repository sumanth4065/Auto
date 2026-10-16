import { Regions } from '@ace-clublabs/aws-cdk-codepipeline';

const vpcIds = {
  dev: {
    [Regions.USWest2]: 'vpc-09cc2504b2a8b5d10',
    [Regions.USEast1]: 'vpc-0158f4dca5116c434'
  },
  qa: {
    [Regions.USWest2]: 'vpc-04c95917e1cd1f063',
    [Regions.USEast1]: 'vpc-084ca9544afa2ba62'
  },
  uat: {
    [Regions.USWest2]: 'vpc-07f45839d74b4fb0d',
    [Regions.USEast1]: 'vpc-05dd28d3390df57e4'
  },
  prod: {
    [Regions.USWest2]: 'vpc-0323bee8c747ac355',
    [Regions.USEast1]: 'vpc-018d3172e02e7be44'
  }
};

const vpcSecurityGroupIds = {
  dev: {
    [Regions.USWest2]: 'sg-0320c42a7ec023a95',
    [Regions.USEast1]: 'sg-0d4f4f97f31cc6f69'
  },
  qa: {
    [Regions.USWest2]: 'sg-0b90d642d06d19514',
    [Regions.USEast1]: 'sg-0c09103cac2563b84'
  },
  uat: {
    [Regions.USWest2]: 'sg-038d5df72081707b0',
    [Regions.USEast1]: 'sg-032696c3fd0464492'
  },
  prod: {
    [Regions.USWest2]: 'sg-04736951148dbdff8',
    [Regions.USEast1]: 'sg-01bf205803d3cf961'
  }
};

const vpcPrivateSubnetIds = {
  dev: {
    [Regions.USWest2]: {
      privateSubnetId1: 'subnet-036aa369c569650cf',
      privateSubnetId2: 'subnet-0f377ff337ced8376',
      privateSubnetId3: 'subnet-0cb6149a95747e286'
    },
    [Regions.USEast1]: {
      privateSubnetId1: 'subnet-0f2e431a785dfa7eb',
      privateSubnetId2: 'subnet-090988130be28761a',
      privateSubnetId3: 'subnet-0b8de138195453d07'
    }
  },
  qa: {
    [Regions.USWest2]: {
      privateSubnetId1: 'subnet-01faec1cb37d83375',
      privateSubnetId2: 'subnet-0b38202ca85a789b6',
      privateSubnetId3: 'subnet-03cde4e0d2dba6f73'
    },
    [Regions.USEast1]: {
      privateSubnetId1: 'subnet-0456d1dec62b3452c',
      privateSubnetId2: 'subnet-073b1123fdd52dd36',
      privateSubnetId3: 'subnet-07b0e629538c9af77'
    }
  },
  uat: {
    [Regions.USWest2]: {
      privateSubnetId1: 'subnet-04787de4bacaafb7f',
      privateSubnetId2: 'subnet-04793afba2c46a25e',
      privateSubnetId3: 'subnet-06fc5e66b93e41e24'
    },
    [Regions.USEast1]: {
      privateSubnetId1: 'subnet-0a5d1e5fafa5c52a7',
      privateSubnetId2: 'subnet-0a00cf70c36c9f2d4',
      privateSubnetId3: 'subnet-02083d4243bd0251f'
    }
  },
  prod: {
    [Regions.USWest2]: {
      privateSubnetId1: 'subnet-0d66efaea3a0ef581',
      privateSubnetId2: 'subnet-0a7f926da48ea1528',
      privateSubnetId3: 'subnet-0391a6e2829063fdb'
    },
    [Regions.USEast1]: {
      privateSubnetId1: 'subnet-01e27d789ed95eb31',
      privateSubnetId2: 'subnet-08b99b1f3d2f211a2',
      privateSubnetId3: 'subnet-08e382ef4f56f6f15'
    }
  }
};
export const constants = {
  WORKLOAD_NAME: 'insurance-claims',
  CDK_STACK_NAME: 'auto-efnol-no-auth-app',
  //Cloudwatch
  PROD_CLOUDWATCH_ACCOUNT_ID: '319189582163',
  NONPROD_CLOUDWATCH_ACCOUNT_ID: '927798449511',
  //VPC
  vpcSecurityGroupIds,
  vpcPrivateSubnetIds,
  vpcIds
};
