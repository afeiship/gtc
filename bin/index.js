#!/usr/bin/env node
const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');

// next packages:
require('@jswork/next');
require('@jswork/next-absolute-package');

const { version } = nx.absolutePackage();
const program = new Command();
const exec = require('child_process').execSync;
const NxJsonConfiguration = require('@jswork/next-json-configuration');
const { execSync } = require('child_process');

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
    start() {
      if (program.init) {
        this.conf.update({ gtc: '@gtc_init' });
        console.log(chalk.green('gtc config added to package.json.'));
      }

      if (program.args.length > 0) {
        const arg = program.args[0];
        const gtcMsg = `@${arg}`;
        this.conf.update({ gtc: gtcMsg });
        this.exec([
          'git add --all',
          `git commit -m "chore: gtc - ${gtcMsg}"`,
          'git push'
        ]);
      }
    }
  }
});
