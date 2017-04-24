# Send mail with capture of web site

This google apps script is to send a capture mail.

## Usage

After you create this google apps script,
you can change `webSiteUrl` variable that you want to get capture.
And you can also change `recipient` variable that you want to receive this capture mail.

```
function sendMail() {
  var webSiteUrl = "https://yukihirai0505.github.io/about/";
  var recipient = "hogehoge@gmail.com";
```

You can change the web site height and width to use `setDimensions` method arguments.

```
var chart = Charts.newTableChart()
    .setDataTable(data)
    .setOption('allowHtml', true)
    .setDimensions(720, 1000)
    .build();
```