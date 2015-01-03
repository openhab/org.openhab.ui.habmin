<a name="0.0.3"></a>
### 0.0.3 (2015-01-02)


#### Bug Fixes

* **Mobile:**
  * Fix routing of persistence services to use server setting ([192368d5](git@github.com:cdjackson/HABmin2/commit/192368d5e32d9d520466f90061a253cf156698d2))
  * Fix error saving and using server address on Android ([4f402e12](git@github.com:cdjackson/HABmin2/commit/4f402e126a63a3384022e30f2c6cfee7cde288a5))
* **UI:**
  * Update blockly flyout style ([bbe889a2](git@github.com:cdjackson/HABmin2/commit/bbe889a2231fc4076285ff5f78426fc9e6362e73))
  * Remove loading spinner when updating data following a change of zoom level ([5574fdde](git@github.com:cdjackson/HABmin2/commit/5574fdde970c3192938cf0600600ae1fe66b79b4))
  * Update resize directive to not resize when element is hidden ([d63930c6](git@github.com:cdjackson/HABmin2/commit/d63930c68049dcce4a2def48039bde7ca07a3d61))
  * Send authenticated event if using cached data ([fe8db276](git@github.com:cdjackson/HABmin2/commit/fe8db27698f74d9c07b3714f5d62c80962e86c11))
  * Fix error getting config data from server if logging in from cached password ([e31d5aa8](git@github.com:cdjackson/HABmin2/commit/e31d5aa856ae891c4500df20a336f09b24bee378))
  * Improve styling of sitemaps to make better use of space ([010aa210](git@github.com:cdjackson/HABmin2/commit/010aa210c994b5ac996b012526df8b05146d68e7))
  * Fix navbar formatting when collapsing on small screens ([29c3dcdf](git@github.com:cdjackson/HABmin2/commit/29c3dcdfa01967c51b5ae370b758a044d9f65d18))
  * Fix sitemap title bar style ([a6a39378](git@github.com:cdjackson/HABmin2/commit/a6a393787b8b3a0fddf4d2cecaaa16ece52b9ff6))
  * Fix error with login and authorisation window ([9a0be091](git@github.com:cdjackson/HABmin2/commit/9a0be09157f7f7a5133e3615fed49d7260fc8753))
  * Update chart series icon styles ([64485dc5](git@github.com:cdjackson/HABmin2/commit/64485dc535987d0918ea34b0fcc11ee597eef6fb))
* **ZWave:**
  * Fix device status if retries is greater than 100% ([5a48ff92](git@github.com:cdjackson/HABmin2/commit/5a48ff92333c21f8d5af3e18d3f82374609cab89))
  * Fix battery icon colour when battery level <40% ([1aa5fdd9](git@github.com:cdjackson/HABmin2/commit/1aa5fdd9976188607813c20dd3917453fd2b0ab7))
  * Fix network diagram resizing ([b875d206](git@github.com:cdjackson/HABmin2/commit/b875d206c744a512322e6d47a33b7517fb60d50f))


#### Features

* **Mobile:**
  * Present login screen if no server set when app starts ([83e3551b](git@github.com:cdjackson/HABmin2/commit/83e3551b61075465e9504640dd1dc7b0cc31b048))
  * Reduce gutter on narrow width screens to provide more real-estate ([14c001a6](git@github.com:cdjackson/HABmin2/commit/14c001a69d58decb92d448c5e8bebe3cc9316d2c))
  * Persist server address to local storage ([8a619066](git@github.com:cdjackson/HABmin2/commit/8a61906618494091e1d01accf1a04a140b4b2eaf))
  *  Initial addition of native mobile versions of HABmin ([d9a403ac](git@github.com:cdjackson/HABmin2/commit/d9a403acdc2b2ac16107e1b0aa3af60b6f3b8269))
* **UI:**
  * Add swipe functionality to change panes easier on mobile device ([ab27c4b0](git@github.com:cdjackson/HABmin2/commit/ab27c4b07ec43454ec2a15961cce8295e4de2fcb))
  * Make rule and schedule templates multi panel for more responsive on phones ([ca49372c](git@github.com:cdjackson/HABmin2/commit/ca49372cf05c6a7c57bab698b8463c0d297eba98))
  * Hide multiple panel switch button when Sitemap displayed ([c0945ec5](git@github.com:cdjackson/HABmin2/commit/c0945ec566c678ea3df7988e102f266dac0cf12b))
  * Add responsive sidebar when in small window (mobile) ([ceae2583](git@github.com:cdjackson/HABmin2/commit/ceae2583fdba9295dd53b3892312d583ead3f0af))
  * Add chart loading spinner to bottom left of chart area ([c89d825a](git@github.com:cdjackson/HABmin2/commit/c89d825a496bfa1db06509d73909c8af34a130cb))
  * Remove some text to improve layout on small screens ([1f247234](git@github.com:cdjackson/HABmin2/commit/1f2472344505c01c433b3e15f46c79c6c473662d))
  * Remove graph button text on medium screens ([8f1aa8e8](git@github.com:cdjackson/HABmin2/commit/8f1aa8e89e3a8433a6f28d26fc99568177f5a181))
  * Remove graph button text on small screens ([fe65e8a9](git@github.com:cdjackson/HABmin2/commit/fe65e8a9dda7fed97d5401fe3af6d1031347b9db))
  * Add shadow to sitemap frame headings ([190425a6](git@github.com:cdjackson/HABmin2/commit/190425a63ea4257073f1e9f37bc1fcd320c3b8fc))
  * Remove icons from growl notifications ([7ce7615a](git@github.com:cdjackson/HABmin2/commit/7ce7615afbfa8b3b5762cfbd86fdaffffbda2c6b))
  * Improve authentication and reload of data when server or user changes ([80f057b7](git@github.com:cdjackson/HABmin2/commit/80f057b73c94812c4ce1251a0e4148638d711c71))
  * Make sitemap titlebar full width ([fe3256dc](git@github.com:cdjackson/HABmin2/commit/fe3256dcb677176bcb6a16801caa5fedb91eedd6))
  * Close navbar when selection made on small screens ([829f0538](git@github.com:cdjackson/HABmin2/commit/829f0538d78b116bf62e9a6e49e7b989cbc7c1d0))
  * Hide some navbar text on smaller screens ([f7e3b3ae](git@github.com:cdjackson/HABmin2/commit/f7e3b3ae29de68d6d4a175f936795935906bda2a))
  * Improve login form and add internationalisation ([b074f31e](git@github.com:cdjackson/HABmin2/commit/b074f31ed9fecdbc238ed299733c48fab0e79849))
  * Improve styling of sitemap widgets ([de1896cb](git@github.com:cdjackson/HABmin2/commit/de1896cb4b86946c5d4a80d75a07884526718332))
  * Add weather-icons ([ae1ce462](git@github.com:cdjackson/HABmin2/commit/ae1ce462eb54e0a8690ae761c709eebfe2079a41))
  * Persist user theme choice to local storage and reset on startup ([2ce3952b](git@github.com:cdjackson/HABmin2/commit/2ce3952bbe5da9cbee822687937d24c6ae782b82))
  * Add theme switching ([eebb64d3](git@github.com:cdjackson/HABmin2/commit/eebb64d371f7a36a5a45ae3820c83fff46aedf65))
* **ZWave:** Add icon and processing for SECURE_KEYPAD_DOOR_LOCK class ([aae19184](git@github.com:cdjackson/HABmin2/commit/aae191849d95b528d67563b9bcba2d35f8d20490))

