#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as ClaimNoAuthCache from './ClaimNoAuthCache';

const app = new cdk.App();
ClaimNoAuthCache.init(app);
