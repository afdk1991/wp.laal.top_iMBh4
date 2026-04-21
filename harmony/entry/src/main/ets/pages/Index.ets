import web_webview from '@ohos.web.webview';

@Entry
@Component
struct Index {
  private webController: web_webview.WebviewController = new web_webview.WebviewController();

  build() {
    Column() {
      Web({ src: $rawfile('index.html'), controller: this.webController })
        .domStorageAccess(true)
        .javaScriptAccess(true)
        .fileAccess(true)
        .zoomAccess(false)
        .onErrorReceive((event) => {
          console.error('WebView错误:', JSON.stringify(event));
        })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FFFFFF')
  }
}
