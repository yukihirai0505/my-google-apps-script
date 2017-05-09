# Hack Topic Mail

## Description

Our company has TOPIC Mail culture.
But it is troublesome to reply the mail.
So I've just come up with a great idea that is to send the reply mail automatically.

## Usage

Prepare the `Reply Message List` google spread sheet first.

The sheet has two columns that is `Reply Message` and `Check`.

![Reply Message List](https://cloud.githubusercontent.com/assets/9312373/25319378/42df9cc0-28d8-11e7-8327-00738b886c4b.png)

Then please add script editor this constantMail.gs.

You should set Slack Library.
=> Library Key: `M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO`

Get the slack incoming api token and set the token as property.
=> `SLACK_ACCESS_TOKEN`

Finally, you can set trigger.