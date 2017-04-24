# Script for Slack

scripts for Slack to pretend to work.

## Usage

First you create the slack outgoing api and set trigger keywords.
And set the token as property.
=> `SLACK_VERIFY_TOKEN`

You should set Slack Library.
=> Library Key: `M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO`

Get the slack incoming api token and set the token as property.
=> `SLACK_ACCESS_TOKEN`


You can custom messages that pretend to work.

```
if (text.match(/良さそう|よさそう|よさげ/)) {
    message = username + "\n:muscle:";
  }
  if (text.match(/承知|かしこ/)) {
    message = username + "\n:sparkles:"
  }
  if (text.match(/すみません|ごめん|申し訳|pull|お願い/)) {
    message = username + "\n:ok_hand:"
  }
```

This script reply slack messages as a user, so you can pretend to work. lol

```
  var options = {
    as_user: true,
    link_names: 1
  };
```