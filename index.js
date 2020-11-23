const Bilibili = require('./api/bilibili');

const tasks = require('./task');

(async function () {
  let taskLists = Object.keys(tasks);
  taskLists = taskLists.filter((f) => !['Base', 'Index'].some((s) => f === s));
  const taskList = taskLists.reduce((acc, taskName) => {
    const taskNameClass = require('./task/' + taskName);
    const newObj = new taskNameClass();
    return acc.concat(newObj);
  }, []);

  let followUpVideoQueue = [];

  const bilibiliAPI = new Bilibili();

  // 登录检查
  await bilibiliAPI.loginCheck();

  // 获取任务完成装填
  const dayTaskStatus = await bilibiliAPI.reward();

  // 关注的 Up 视频列表
  const followUpVideoList = await bilibiliAPI.queryDynamicNew();

  const rankList = await bilibiliAPI.getRegionRank();

  if (followUpVideoList.length > 0) {
    followUpVideoQueue = followUpVideoList;
  }

  // 如果观看任务没有完成
  if (!dayTaskStatus.watch) {
    await bilibiliAPI.videoHeartBeat(
      rankList[parseInt(Math.random() * rankList.length)]
    );
  } else {
    console.info('----- 本日观看视频任务已经完成了，不需要再观看视频了 -----');
  }

  // 分享任务
  if (!dayTaskStatus.share) {
    await bilibiliAPI.videoShare(
      rankList[parseInt(Math.random() * rankList.length)]
    );
  } else {
    console.info('----- 本日分享视频任务已经完成了，不需要再分享视频了 -----');
  }

  for (const task of taskList) {
    console.info(`----- 执行 ${task.getTaskName()} -----`);
    await task.run();
  }
})();
