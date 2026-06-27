# AWS IAM Permissions Required for Amplify Gen 2 Deployment

## Current Issue

IAM user **edgarmc** (Account: 108742334699) lacks permissions to bootstrap and deploy Amplify Gen 2 backend.

**Error encountered:**
```
The region us-east-1 has not been bootstrapped.
User is not authorized to perform: cloudformation:ListStacks
```

---

## Required Permissions

### Option 1: Use AWS Managed Policies (Easiest)

Attach these managed policies to user **edgarmc**:

1. **AdministratorAccess-Amplify**
   - AWS managed policy specifically for Amplify
   - Includes permissions for Cognito, AppSync, Lambda, DynamoDB

2. **AWSCloudFormationFullAccess**
   - Required for stack creation/updates
   - Needed for initial bootstrapping

**How to apply (via AWS Console):**
1. Go to IAM → Users → edgarmc
2. Click "Add permissions" → "Attach policies directly"
3. Search and select both policies above
4. Click "Add permissions"

---

### Option 2: Minimal Custom Policy (More Secure)

If you prefer granular control, use this **improved** custom policy with restricted `iam:PassRole`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AmplifyGen2CoreServices",
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "cognito-idp:*",
        "cognito-identity:*",
        "appsync:*",
        "dynamodb:*",
        "lambda:*",
        "s3:*",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:TagResource",
        "logs:UntagResource",
        "ssm:GetParameter",
        "ssm:GetParametersByPath",
        "ssm:DescribeParameters",
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "ssm:AddTagsToResource",
        "ssm:RemoveTagsFromResource",
        "amplify:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AmplifyIAMRoleManagement",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:PutRolePolicy",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:GetRole",
        "iam:DeleteRole",
        "iam:DeleteRolePolicy",
        "iam:TagRole",
        "iam:UntagRole",
        "iam:UpdateAssumeRolePolicy",
        "iam:GetRolePolicy",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies"
      ],
      "Resource": [
        "arn:aws:iam::108742334699:role/amplify-*",
        "arn:aws:iam::108742334699:role/cdk-*"
      ]
    },
    {
      "Sid": "AmplifyPassRoleRestricted",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": [
        "arn:aws:iam::108742334699:role/amplify-*",
        "arn:aws:iam::108742334699:role/cdk-*"
      ],
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": [
            "lambda.amazonaws.com",
            "appsync.amazonaws.com",
            "cognito-idp.amazonaws.com",
            "cloudformation.amazonaws.com"
          ]
        }
      }
    }
  ]
}
```

**What This Policy Includes:**

- **SSM (Systems Manager)**: Required for Amplify to store and retrieve configuration parameters
  - `ssm:GetParametersByPath` - Read secret configurations
  - `ssm:DescribeParameters` - List available parameters
  - Essential for sandbox environment setup

**Security Improvements in This Policy:**

This policy addresses the AWS security warning about `iam:PassRole` by:

1. **Restricted Resources**: Only allows passing roles that start with `amplify-*` or `cdk-*`
   - Cannot pass arbitrary IAM roles
   - Limits scope to Amplify-created roles only

2. **Service Condition**: Uses `iam:PassedToService` condition to restrict which AWS services can receive roles
   - Only Lambda, AppSync, Cognito, and CloudFormation
   - Prevents passing roles to unrelated services

3. **Separated Statements**: IAM permissions split into logical groups
   - Core AWS services (no IAM)
   - IAM role management (restricted resources)
   - PassRole (most restrictive - resources + conditions)

**Quick Upload Option:**
Use the pre-made JSON file: `docs/amplify-gen2-secure-policy.json`

**How to apply (via AWS Console):**
1. Go to IAM → Policies → Create policy
2. Choose JSON tab and paste the policy above (or upload `amplify-gen2-secure-policy.json`)
3. Name it: `AmplifyGen2DeploymentPolicy`
4. Click "Create policy" (the warning should NOT appear with this version)
5. Go to IAM → Users → edgarmc → Add permissions → Attach policies directly
6. Search for and attach `AmplifyGen2DeploymentPolicy`

---

### Option 3: Use AWS CLI (If you have admin access elsewhere)

If you have access to an admin AWS profile:

```bash
# Create the custom policy
aws iam create-policy \
  --policy-name AmplifyGen2DeploymentPolicy \
  --policy-document file://amplify-gen2-policy.json

# Attach to user
aws iam attach-user-policy \
  --user-name edgarmc \
  --policy-arn arn:aws:iam::108742334699:policy/AmplifyGen2DeploymentPolicy
```

---

## After Permissions Are Added

Once permissions are granted, restart the deployment:

```bash
# Verify permissions
aws cloudformation list-stacks --region us-east-1 --max-items 1

# If successful, deploy Amplify backend
npx ampx sandbox
```

---

## Alternative: Use AWS Sandbox Account

If modifying permissions in the production account is not possible, consider:

1. Create a new AWS account for development
2. Use AWS Organization's sandbox account
3. Use AWS SSO with temporary elevated credentials

---

## Security Best Practices

1. **Principle of Least Privilege**: Use Option 2 (custom policy) for production
2. **Temporary Credentials**: Consider using AWS SSO for time-limited access
3. **Separate Environments**: Use different AWS accounts for dev/staging/prod
4. **Regular Audits**: Review IAM permissions quarterly

---

## Next Steps

1. ✅ Send this document to your AWS administrator
2. ⏳ Wait for permissions to be added to **edgarmc** user
3. ⏳ Verify with: `aws cloudformation list-stacks --region us-east-1`
4. ⏳ Run: `npx ampx sandbox`
5. ⏳ Continue with backend deployment

---

**Document Created:** 2026-06-22
**AWS Account:** 108742334699
**IAM User:** edgarmc
**Region:** us-east-1
