<a name="0.0.5"></a>
### 0.0.5 (2015-01-18)


#### Bug Fixes

* **UI:**
  * Fix error loading models with a single return #1 ([ce9677d2](git@github.com:cdjackson/HABmin2/commit/ce9677d2d8d4aad6a13b7eb707d52ba96f654034))
  * Fixed error displaying sitemaps when only 1 sitemap defined ([3b79ed69](git@github.com:cdjackson/HABmin2/commit/3b79ed69599ab04805cfa1b73b1d2fcbe864fbfd))
* **ZWave:**
  * Log Reader - fix SENSOR_BINARY commands ([dfe50885](git@github.com:cdjackson/HABmin2/commit/dfe5088542d6f5c410aeaa2213b832e3d946b2dd))
  * Log Reader - trigger screen re-layout when changing views ([0afe39e4](git@github.com:cdjackson/HABmin2/commit/0afe39e45f13b88a923aa7729f05df22f8579af7))
  * Log reader made tolerant of wider range of log formats ([f570d19e](git@github.com:cdjackson/HABmin2/commit/f570d19ea0bf442d1cdcc6f5f4b689df251f8ff6))


#### Features

* **UI:** Log Reader - Add node information display ([bfc89195](git@github.com:cdjackson/HABmin2/commit/bfc8919564c0a525ce560df782599eaf94a6bfad))
* **ZWave:**
  * Log Reader - sorted nodes in filter list ([ce2b3794](git@github.com:cdjackson/HABmin2/commit/ce2b3794b2e3f82f2a6d76ba5c961926b344e564))
  * Log Reader - Process multi_instance report ([68c33e06](git@github.com:cdjackson/HABmin2/commit/68c33e06036806cdec425b44575c1fe140d5eb21))
  * Log Reader - add SUC-ID display handler ([379e9786](git@github.com:cdjackson/HABmin2/commit/379e9786410665c3d1f329857b463692a3cc905f))
  * Log Reader - add processing of ApplicationUpdate message ([71f7fcf1](git@github.com:cdjackson/HABmin2/commit/71f7fcf196185ee19d9c039accdbcdd9e455d084))
  * Log Reader - add BASIC command class names ([b22b3b97](git@github.com:cdjackson/HABmin2/commit/b22b3b973b4d10a5d45298ad5f269f0b59de8f4e))
  * Log Reader - add processing of neighbour and routing frames ([34672151](git@github.com:cdjackson/HABmin2/commit/34672151799b97fec8f0a331638e839a7081d7d8))
  * Log Reader - process node discovery message ([e98517f9](git@github.com:cdjackson/HABmin2/commit/e98517f956c18825fdfe60e9ea3892f0dd085bb6))
  * Log Reader - process system and node identify frames ([204cc084](git@github.com:cdjackson/HABmin2/commit/204cc08462eb92766f5228526b6c79cae077616a))
  * Added MANUFACTURER and VERSION logging classes ([fbcbe9f6](git@github.com:cdjackson/HABmin2/commit/fbcbe9f6495c5b67af9bdfed78dd4529a98f3776))
  * Add error/warning annotations to log entries ([a8bac573](git@github.com:cdjackson/HABmin2/commit/a8bac573e988bb4f4c7da053244059a9e7773819))
  * Log viewer added annotations for completed transaction ([036686c4](git@github.com:cdjackson/HABmin2/commit/036686c44f66887d672b9654ab26170428769d5b))
  * Make log viewer parse files without date ([6aed0864](git@github.com:cdjackson/HABmin2/commit/6aed086400b8326b4999fc9f170a071178f21071))
  * Add processing of controller commands in Log Reader ([5d8a8e3a](git@github.com:cdjackson/HABmin2/commit/5d8a8e3ae11faaaa9e8bca23c5f6187671b8a045))

