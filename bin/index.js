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
  { name: '@beta: 发布到 beta 环境', value: 'beta' },
  { name: '@prod: 发布到 prod 环境', value: 'prod' },
  { name: '@build: 仅打包当前项目', value: 'build' },
  { name: '@upload_beta: 上传到 beta 环境', value: 'upload-beta' },
  { name: '@upload-prod: 上传到 prod 环境', value: 'upload-prod' }
];

program.version(version);

program
  .option('-d, --debug', 'only show cmds, but not clean.')
  .option('-i, --init', 'Add gtc config to package.json.')
  .option('-s, --src <string>', 'source filepath.', './src')
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
      const gtcMsg = DEFAULT_COMMANDS.find(item => item.value === inCmd).name;
      this.conf.update({ gtc: gtcMsg });
      this.exec([
        'git add --all',
        `git commit -m "chore: gtc - ${gtcMsg}"`,
        'git push'
      ]);
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
