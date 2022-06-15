#!/usr/bin/env node
const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const ipt = require('ipt');

// next packages:
require('@jswork/next');
require('@jswork/next-absolute-package');

const { version } = nx.absolutePackage();
const program = new Command();
const NxJsonConfiguration = require('@jswork/next-json-configuration');
const { execSync } = require('child_process');

const opts = { stdin: process.stdin, stdout: process.stdout };
const DEFAULT_COMMANDS = [
  { name: '@build: 仅打包当前项目', value: 'build' },
  { name: '@upload-beta: 上传到 beta 环境', value: 'upload-beta' },
  { name: '@upload-staging: 上传到 staging 环境', value: 'upload-staging' },
  { name: '@upload-production: 上传到 production 环境', value: 'upload-production' },
  { name: '@beta: 发布到 beta 环境', value: 'beta' },
  { name: '@staging: 发布到 staging 环境', value: 'staging' },
  { name: '@production: 发布到 production 环境', value: 'production' }
];

program.version(version);

program
  .option('-d, --debug', 'only show cmds, but not clean.')
  .option('-i, --init', 'Add gtc config to package.json.')
  .parse(process.argv);

nx.declare({
  statics: {
    init() {
      const app = new this();
      app.start();
    }
  },
  methods: {
    init() {
      this.conf = new NxJsonConfiguration({
        path: path.join(process.cwd(), 'package.json')
      });
    },

    exec(inCmds) {
      const cmdstr = inCmds.join(' && ');
      console.log(chalk.green(cmdstr));
      if (!program.debug) execSync(cmdstr);
    },

    gtc(inCmd) {
      const cmd = DEFAULT_COMMANDS.find((item) => item.value === inCmd);
      const gtcMsg = cmd ? cmd.name : inCmd;
      const formated = gtcMsg + ' at ' + new Date().toLocaleString();
      this.conf.update({ gtc: formated });
      this.exec(['git add --all', `git commit -m "chore: gtc - ${formated}"`, 'git push']);
    },

    main() {
      ipt(DEFAULT_COMMANDS, opts).then(([inCmd]) => {
        this.gtc(inCmd);
      });
    },

    start() {
      if (program.init) {
        this.conf.update({ gtc: '@gtc_init' });
        console.log(chalk.green('gtc config added to package.json.'));
      }

      if (program.args.length > 0) {
        const arg = program.args[0];
        this.gtc(arg);
      }

      this.main();
    }
  }
});
