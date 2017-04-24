# Script for Slack with GitHub

scripts for Slack with GitHub

## Usage


You should set Slack Library.
=> Library Key: `M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO`

Get the slack incoming api token and set the token as property.
=> `SLACK_ACCESS_TOKEN`

Get the GitHub access token and set the token as property.
=> `GITHUB_ACCESS_TOKEN`

And create slack out-going api, and set trigger keywords.

you can use

```
trigger title body @mention
```

You can custom repository and owner that you want to create issue repository.

```
var OWNER= "yukihirai0505";
var REPO = "my-google-apps-script";
```