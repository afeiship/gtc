#!/usr/bin/env node
const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const ipt = require('ipt');
const dateformat = require('dateformat');
const DEFAULT_FORMAT = 'yyyy-mm-dd HH:MM:ss';
const kiv = require('@jswork/kiv');
const prettier = require('prettier');

// next packages:
require('@jswork/next');
// require('@jswork/next-absolute-package');

const currentPkg = require('../package.json');
const { version, name } = currentPkg;
const program = new Command();
const NxJsonConfiguration = require('@jswork/next-json-configuration');
const { execSync } = require('child_process');
const STR2ICON = {
  '@beta': '🍏',
  '@staging': '🍊',
  '@production': '🍎',
  '@upload': '🚚',
  '@cache': '📦'
};

const opts = { stdin: process.stdin, stdout: process.stdout };
const DEFAULT_COMMANDS = {
  commands: [
    { name: '发布到 beta 环境', value: 'beta' },
    { name: '发布到 staging 环境', value: 'staging' },
    { name: '发布到 production 环境', value: 'production' },
    { name: '仅 build 当前项目', value: 'build' },
    { name: '仅上传到 beta 环境', value: 'upload-beta' },
    { name: '仅上传到 staging 环境', value: 'upload-staging' },
    { name: '仅上传到 production 环境', value: 'upload-production' },
    { name: '仅更新 cache 的 node_modules', value: 'cache' }
  ]
};

program.version(version);

program
  .option('-d, --debug', 'Only show cmds, but not clean.')
  .option('-u, --check-update', 'Check if has new udpate.')
  .option('-i, --init', 'Add gtc config to package.json.')
  .parse(process.argv);

nx.declare({
  statics: {
    init() {
      const app = new this();
      app.start();
    }
  },
  properties: {
    commands: function () {
      // get current rc file(.gtcrc)
      const homeRcFile = path.resolve(process.env.HOME, '.gtcrc');
      const cwdRcFile = path.resolve(process.cwd(), '.gtcrc');
      const rcFile = fs.existsSync(cwdRcFile) ? cwdRcFile : homeRcFile;

      if (fs.existsSync(rcFile)) {
        const buf = fs.readFileSync(rcFile, 'utf8');
        const rc = JSON.parse(buf);
        return rc.commands;
      }
      return DEFAULT_COMMANDS.commands;
    }
  },
  methods: {
    init() {
      this.conf = new NxJsonConfiguration({
        path: path.join(process.cwd(), 'package.json')
      });
    },

    action(cmd) {
      return `__@${cmd.value}__`;
    },

    exec(inCmds) {
      const cmdstr = inCmds.join(' && ');
      console.log(chalk.green(cmdstr));
      if (!program.debug) execSync(cmdstr);
    },

    gtc(inCmd) {
      const cmd = this.commands.find((item) => item.value === inCmd);
      const gtcMsg = cmd ? `${cmd.name} ${this.action(cmd)}` : inCmd;
      const formated = gtcMsg + ' at ' + dateformat(null, DEFAULT_FORMAT);
      const icon = cmd.icon || kiv(gtcMsg, STR2ICON);
      this.conf.update({ gtc: formated });
      this.exec(['git pull', 'git add --all', `git commit -m "chore: ${icon} ${formated}"`, 'git push']);
    },

    main() {
      ipt(this.commands, opts).then(([inCmd]) => {
        this.gtc(inCmd);
      });
    },

    checkUpdate() {
      const lastetVersion = execSync(`npm show ${name} version`).toString().trim();
      if (lastetVersion !== version) {
        console.log(chalk.yellow(`${version} is outdated, latest version is ${lastetVersion}`));
        console.log(chalk.yellow(`Please use "npm i -g ${name}" to update`));
      } else {
        console.log(chalk.green(`Current version ${version} is up to date`));
      }
    },

    start() {
      if (program.init) {
        const cmdStr = JSON.stringify(DEFAULT_COMMANDS);
        const prettyConfig = prettier.format(cmdStr, { parser: 'json', tabWidth: 2 });
        fs.writeFileSync('./.gtcrc', prettyConfig, 'utf8');
        return console.log(chalk.green('gtc init success!'));
      }

      if (program.args.length > 0) {
        const arg = program.args[0];
        this.gtc(arg);
      }

      if (program.checkUpdate) {
        this.checkUpdate();
      } else {
        this.main();
      }
    }
  }
});
