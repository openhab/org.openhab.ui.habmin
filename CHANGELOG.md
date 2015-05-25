<a name="0.0.14"></a>
### 0.0.14 (2015-05-25)


#### Bug Fixes

* **Chart:** Fix panel resizing when switching between chart and item view Fixes https://gith ([ce7b57b4](git@github.com:cdjackson/HABmin2/commit/ce7b57b48f4e669d49c7e6d07c0859224a56df47))
* **Dashboard:**
  * Ensure gauge value is always a number ([d9fa4736](git@github.com:cdjackson/HABmin2/commit/d9fa47360dea0e7ec43a8f7fe13c49729dc0fd70), closes [#44](git@github.com:cdjackson/HABmin2/issues/44))
  * Fixed updating of text items ([5649b01a](git@github.com:cdjackson/HABmin2/commit/5649b01ad5cfb2bf311ba506c4e38d2c6cb8c1b5))
  * Fix dashboard menu format when no dashboards saved ([4668dcde](git@github.com:cdjackson/HABmin2/commit/4668dcde6923ebf0700a8e3271e66d348771c9f0))
  * Ensure all items can be selected in dashboard ([fcf16e0d](git@github.com:cdjackson/HABmin2/commit/fcf16e0dee118f47101598d27add47c8ff7574c1))
  * Fixed selection of item used in gauge widget #35 ([95324996](git@github.com:cdjackson/HABmin2/commit/9532499642f21c8aab94282fbc48c1f6ffb8e96b))
* **Things:** Disable SAVE button when no thing loaded #21 ([d988bdae](git@github.com:cdjackson/HABmin2/commit/d988bdaea0112c26f3e89ad00814229cd86bc320))
* **UI:**
  * Fix display of selected language with localised characters #36 ([d13bfba5](git@github.com:cdjackson/HABmin2/commit/d13bfba5a309c700e28d07353c7045dca95097f0))
  * Fix bug in localisation handler when loading multiple locales ([d5faf685](git@github.com:cdjackson/HABmin2/commit/d5faf6855ee940cf30107ab8ec9f221efdc76936))


#### Features

* **Chart:**
  * Add notification if no persistence services available Fixes https://github.com/c ([ff524984](git@github.com:cdjackson/HABmin2/commit/ff524984534c13b391119f51b8a45aecc53ef0b8))
  * Remove persistence service selection if only 1 option available ([b26ed771](git@github.com:cdjackson/HABmin2/commit/b26ed77161601e710edafeceade9b662cd606370))
* **Dashboard:**
  * Highlight SAVE button when dashboard has been changed ([706c8efb](git@github.com:cdjackson/HABmin2/commit/706c8efb27afeb66d3a0e076510950c6129dd0f8))
  * Update gauges dynamically when state changes ([a135cc1e](git@github.com:cdjackson/HABmin2/commit/a135cc1ea12434149e7ddfcc182eb0612f525597))
  * Add group control widget ([34b0e98a](git@github.com:cdjackson/HABmin2/commit/34b0e98aa427e3dd7d3881f12a25d433dcffe985))
  * Display widget configuration dialog after adding new widget ([0565a1c3](git@github.com:cdjackson/HABmin2/commit/0565a1c354e431198826adf8ac3a346d803d663c))
  * Add category to dashboard config to enable menu icon ([61c66fce](git@github.com:cdjackson/HABmin2/commit/61c66fceeebebefafd16d7de82ac2d7fc9d52b09))
  * Add image widget to dashboard ([640ffbab](git@github.com:cdjackson/HABmin2/commit/640ffbab9b664032b2400d8c155594f5c8e83c20))
  * Allow dashboards to be hidden from the menu #34 ([94a5f6a0](git@github.com:cdjackson/HABmin2/commit/94a5f6a093f4664f4e04f8f80dab01bdb7357470))
* **OpenHAB2:** Change chart resource to use OH2 native persistence ([5fc19233](git@github.com:cdjackson/HABmin2/commit/5fc192339eaaffe607e8c362dcde4bee8147c1f8))
* **Things:**
  * Manage save/cancel buttons in Thing configuration Fixes https://github.com/cdjac ([a3115cd8](git@github.com:cdjackson/HABmin2/commit/a3115cd84ebf18e1735fe89743e07f03179081ae))
  * Updated thing configuration to support new ESH groups ([7fa4a07c](git@github.com:cdjackson/HABmin2/commit/7fa4a07cc7b77483057a4eb4f758fb2b4a89331e))
* **UI:**
  * Inhibit display until load and layout is complete ([5cafa1eb](git@github.com:cdjackson/HABmin2/commit/5cafa1eb2fa903d549ece63943448602c2f32ce8))
  * Add support for new OpenHAB dashboard service ([1571f0b7](git@github.com:cdjackson/HABmin2/commit/1571f0b7e7e1cb3fa28fce3e40f58a0610050972))
  * Add error notification if server can't be reached ([df709730](git@github.com:cdjackson/HABmin2/commit/df709730ecf3eea1d478a84475ee095066f0e53d))

