#!/usr/bin/env node
const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const ipt = require('ipt');
const prettier = require('prettier');
const { nodeGtc, DEFAULT_COMMANDS, GtcVersion } = require('@jswork/node-gtc');

// next packages:
require('@jswork/next');
require('@jswork/next-key-map');
// require('@jswork/next-absolute-package');

const currentPkg = require('../package.json');
const { version, name } = currentPkg;
const program = new Command();
const NxJsonConfiguration = require('@jswork/next-json-configuration');
const { execSync } = require('child_process');
const opts = { stdin: process.stdin, stdout: process.stdout };

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
    commandRc: function () {
      // get current rc file(.gtcrc)
      const homeRcFile = path.resolve(process.env.HOME, '.gtcrc');
      const cwdRcFile = path.resolve(process.cwd(), '.gtcrc');
      const rcFile = fs.existsSync(cwdRcFile) ? cwdRcFile : homeRcFile;

      if (fs.existsSync(rcFile)) {
        const buf = fs.readFileSync(rcFile, 'utf8');
        const rc = JSON.parse(buf);
        return rc;
      }
      return DEFAULT_COMMANDS;
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
      const { cmds, message } = nodeGtc(this.commandRc, inCmd);
      // gtcVersion logic
      const gtcVersion = this.getGtcVersion(inCmd);
      // update package.json
      this.conf.update({ gtc: message, gtcVersion });
      this.exec(cmds);
    },

    main() {
      const { commands } = this.commandRc;
      const cmds = nx.keyMap(commands, { label: 'name' });
      ipt(cmds, opts).then(([inCmd]) => {
        this.gtc(inCmd);
      });
    },

    getGtcVersion(inCmd) {
      const { autoVersion } = this.commandRc;
      const isProduction = inCmd === 'production';
      const isCache = inCmd === 'cache';
      const curGtcVersion = this.conf.get('gtcVersion') || '1.0.0';
      const method = isProduction ? 'release' : 'patch';
      const identity = isCache ? 'beta' : inCmd;
      const newGtcVersion = GtcVersion[method](curGtcVersion, inCmd);
      return autoVersion ? newGtcVersion : curGtcVersion;
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
