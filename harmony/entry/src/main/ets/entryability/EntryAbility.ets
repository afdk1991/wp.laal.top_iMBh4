import UIAbility from '@ohos.app.ability.UIAbility';
import window from '@ohos.window';

export default class EntryAbility extends UIAbility {
  onCreate(want, launchParam) {
    console.log('[EntryAbility] onCreate');
  }

  onDestroy() {
    console.log('[EntryAbility] onDestroy');
  }

  onWindowStageCreate(windowStage: window.WindowStage) {
    console.log('[EntryAbility] onWindowStageCreate');
    windowStage.loadContent('pages/Index', (err, data) => {
      if (err.code) {
        console.error('加载页面失败', JSON.stringify(err));
        return;
      }
      console.info('加载页面成功', JSON.stringify(data));
    });
  }

  onWindowStageDestroy() {
    console.log('[EntryAbility] onWindowStageDestroy');
  }

  onForeground() {
    console.log('[EntryAbility] onForeground');
  }

  onBackground() {
    console.log('[EntryAbility] onBackground');
  }
}
