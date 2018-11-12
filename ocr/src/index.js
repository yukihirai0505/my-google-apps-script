global.ocr = () => {
  const imageBlob = UrlFetchApp.fetch(
    'https://yabaiwebyasan.com/wp-content/uploads/2018/11/yukihirai.jpg'
  ).getBlob()
  const resource = {
    title: imageBlob.getName(),
    mimeType: imageBlob.getContentType()
  }
  const options = {
    ocr: true
  }
  const imgFile = Drive.Files.insert(resource, imageBlob, options)
  const doc = DocumentApp.openById(imgFile.id)
  const text = doc
    .getBody()
    .getText()
    .replace('\n', '')
  Logger.log(text)
  Drive.Files.remove(imgFile.id)
}
