import { Stack, type StackProps } from 'aws-cdk-lib';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import type { Construct } from 'constructs';
import type { StageConfig } from './config';

/** Cost guardrails ($1/$5/$10 budget alerts) and alarm notifications by email. */
export class ObservabilityStack extends Stack {
  constructor(scope: Construct, id: string, cfg: StageConfig, deps: { alarms: cloudwatch.Alarm[] }, props?: StackProps) {
    super(scope, id, props);

    const topic = new sns.Topic(this, 'Alerts', { displayName: `JFA ${cfg.stage} alerts`, enforceSSL: true });
    if (cfg.alertEmail) topic.addSubscription(new subs.EmailSubscription(cfg.alertEmail));
    for (const alarm of deps.alarms) alarm.addAlarmAction(new actions.SnsAction(topic));

    // Budgets are account-wide; create them once (from the prod or the only stage).
    if (cfg.alertEmail && (cfg.stage === 'prod' || this.node.tryGetContext('createBudgets') !== 'false')) {
      for (const amount of [1, 5, 10]) {
        new budgets.CfnBudget(this, `Budget${amount}`, {
          budget: {
            budgetName: `jfa-monthly-${amount}usd-${cfg.stage}`,
            budgetType: 'COST',
            timeUnit: 'MONTHLY',
            budgetLimit: { amount, unit: 'USD' },
          },
          notificationsWithSubscribers: [
            {
              notification: { notificationType: 'ACTUAL', comparisonOperator: 'GREATER_THAN', threshold: 100, thresholdType: 'PERCENTAGE' },
              subscribers: [{ subscriptionType: 'EMAIL', address: cfg.alertEmail }],
            },
          ],
        });
      }
    }
  }
}
