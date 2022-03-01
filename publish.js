const process = require('child_process')

process.exec(`cd .githubrepo && git add . && git commit -m '自动更新' && git push origin master`, (err, stdout, stderr) => {
  if (err) {
    console.error('github发布失败：', stderr)
  } else {
    console.log(stdout)
  }
})
