## [4.5.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.5.0...web-vue-v4.5.1) (2026-09-10)


### Bug Fixes

* **affix:** update fixed position when offsets change ([317c938](https://github.com/liunnn1994/sd-design/commit/317c93823f2baa1f0f7b680272cf91e0af220c7f))
* **anchor:** synchronize scroll and link lifecycle ([abd2791](https://github.com/liunnn1994/sd-design/commit/abd27918634620a1366fba049a30db1a2160cc25))
* **auto-complete:** cover boundary and virtual list interactions ([3d677d2](https://github.com/liunnn1994/sd-design/commit/3d677d26713d358220367cf77f43485d23ec093b))
* **avatar:** refresh image text and group lifecycle state ([1d1fe66](https://github.com/liunnn1994/sd-design/commit/1d1fe669b0e4573bba8825aba9f5a9f29fcf91f3))
* **back-top:** refresh targets and cancel stale scrolling ([8e14356](https://github.com/liunnn1994/sd-design/commit/8e14356f2ad9146d033a078e0b12ddd77b4f4c02))
* **back-top:** use portable tween instance type ([3fd758f](https://github.com/liunnn1994/sd-design/commit/3fd758fc44b63e88d77ed9205105258f4583139d))
* **badge:** refresh slot positioning and respect custom content ([bcc900f](https://github.com/liunnn1994/sd-design/commit/bcc900f14d8eff05f0d176269c60d654309451f8))
* **basic-crud-table:** guard async results and refresh dynamic slots ([8c61f45](https://github.com/liunnn1994/sd-design/commit/8c61f4502829a0f3976a13b8854b8ef822b809c3))
* **bloom-menu:** respect rejected controlled open requests ([1bb1258](https://github.com/liunnn1994/sd-design/commit/1bb1258b3fb8847059c36b00e682d46ed3bf6a13))
* **border-beam:** reconcile motion preferences and dynamic geometry ([8885e8a](https://github.com/liunnn1994/sd-design/commit/8885e8a4da834c94f67b36d99d9236d9a5a5f9c3))
* **breadcrumb:** synchronize dynamic slots and route counts ([fa96c23](https://github.com/liunnn1994/sd-design/commit/fa96c23d7495a9217a04e1eb9a2230fd8d5f0496))
* **build:** restore standard TypeScript toolchain ([f92c864](https://github.com/liunnn1994/sd-design/commit/f92c864ed885ae0ad7ded17fdb0345401f4f449a))
* **button:** preserve attributes and react to tooltip slot changes ([5aabf31](https://github.com/liunnn1994/sd-design/commit/5aabf3154be5c9867f5d20a86b1953a05c2bf5c2))
* **calendar:** apply explicit locale to control labels ([003fdb5](https://github.com/liunnn1994/sd-design/commit/003fdb59125a11380c6618e8a7c41ac87474baa9))
* **calendar:** honor per-instance week start during navigation ([9fd96ef](https://github.com/liunnn1994/sd-design/commit/9fd96ef9fe8eb5294704a789d0054aa04b644d3d))
* **calendar:** isolate date formatting between locale instances ([3e84889](https://github.com/liunnn1994/sd-design/commit/3e84889c32835669a08cfd02398ba947c6a83065))
* **calendar:** keep cross-calendar moves independent of deletion ([d0aba5f](https://github.com/liunnn1994/sd-design/commit/d0aba5f474aedb92f726e9ea47f39dd53687e4c9))
* **calendar:** stabilize event updates and interaction lifecycles ([683a68d](https://github.com/liunnn1994/sd-design/commit/683a68d2c0ee019fbc240ff6d16e8eb49be52794))
* **calendar:** use ISO week numbers across locales ([28b3236](https://github.com/liunnn1994/sd-design/commit/28b32360128e445f6f039a48c900647d7623b5b3))
* **card:** restore child state and react to dynamic slots ([fd7dbc5](https://github.com/liunnn1994/sd-design/commit/fd7dbc5b0c88d5720d3c8d694a2b47b9d990440a))
* **carousel:** handle dynamic slides and playback boundaries ([5099802](https://github.com/liunnn1994/sd-design/commit/5099802f2e25af938f7d853cc6992d7c7786928e))
* **cascader:** guard async loads and clean up pending search ([67a2aa0](https://github.com/liunnn1994/sd-design/commit/67a2aa042df71351495089a9f35b92a9075c4f75))
* **cascader:** prevent collisions between hyphenated option paths ([c83aa6e](https://github.com/liunnn1994/sd-design/commit/c83aa6e2f085c3e9fa39731671430c5f83fc1582))
* **cascader:** react to virtual list configuration changes ([2f8c252](https://github.com/liunnn1994/sd-design/commit/2f8c252386f76402d547789d47e76b794dda19b4))
* **cascader:** rebuild dynamic indexes and guard parent selection ([a9cfd67](https://github.com/liunnn1994/sd-design/commit/a9cfd6792f1ceecc3ae10370ea5c327d3d337085))
* **cascader:** refresh lazy caches and match literal value keys ([e29b0c7](https://github.com/liunnn1994/sd-design/commit/e29b0c7bf119c87e27f2bb866449a97926607e86))
* **cascader:** respect disabled options during keyboard navigation ([8fcdb4c](https://github.com/liunnn1994/sd-design/commit/8fcdb4c970846cdb0ceb51f5f0b4862f368b9790))
* **cascader:** share lazy loading across mouse and keyboard navigation ([87af762](https://github.com/liunnn1994/sd-design/commit/87af762fc6393f5b5868b199b1bf7b1ad70a7da0))
* **checkbox:** restore controlled mixed state after activation ([aa0135b](https://github.com/liunnn1994/sd-design/commit/aa0135b25d2f22f329e82c54704d2c8cef5c8287))
* **collapse:** preserve nested keyboard controls and icon spacing ([2d35eb0](https://github.com/liunnn1994/sd-design/commit/2d35eb0a884303c80b92b25ab9fa99946415a1bf))
* **collapse:** synchronize dynamic content destruction ([c658035](https://github.com/liunnn1994/sd-design/commit/c65803581206e25d0d62d58e93a2aec331f075ce))
* **color-picker:** apply edits from the HEX8 alpha field ([c707c36](https://github.com/liunnn1994/sd-design/commit/c707c363818645b9e1408676023b49c8b1010d91))
* **color-picker:** clean up drags and enforce disabled state ([697930a](https://github.com/liunnn1994/sd-design/commit/697930a297f9951619ac769b0200971050c0f890))
* **color-picker:** honor readonly and controlled panel values ([eef2b56](https://github.com/liunnn1994/sd-design/commit/eef2b562adcaf5d5f8b213d5a5c1d85d2fc5eb3e))
* **comment:** render dynamically added slots ([30b3d7e](https://github.com/liunnn1994/sd-design/commit/30b3d7e755255da5da4e37b7311b8f144239454b))
* **config-provider:** inherit nested popup themes reactively ([2bada96](https://github.com/liunnn1994/sd-design/commit/2bada9600b9d7f3c8ded102a9d8bb556d1941b45))
* **config-provider:** preserve overlapping global theme ownership ([fa2d1b6](https://github.com/liunnn1994/sd-design/commit/fa2d1b64fe31325e503131106e9d2ab3dff5c494))
* **config-provider:** restore overwritten global theme tokens ([cedf7ec](https://github.com/liunnn1994/sd-design/commit/cedf7ecdc427b05393816b50b8999879a3964100))
* **config-provider:** restore theme when leaving global scope ([8cfb5a3](https://github.com/liunnn1994/sd-design/commit/8cfb5a3d2b1456846fb6df4e25078edbb4347c97))
* **copy:** preserve async payload and stop feedback after unmount ([323d13a](https://github.com/liunnn1994/sd-design/commit/323d13ac2509f4ae9ca5de5efcd9117f66fec8e7))
* **copy:** refresh accessible names when text slots change ([ca00c10](https://github.com/liunnn1994/sd-design/commit/ca00c1016e51df9009a12ac9e3a847e27621c0bd))
* **cropper:** align selection after replacement image renders ([c67f72e](https://github.com/liunnn1994/sd-design/commit/c67f72e78112ce94b6211a525ac2aca81dfb9613))
* **cropper:** cancel pending initialization after destroy ([6bfa1b6](https://github.com/liunnn1994/sd-design/commit/6bfa1b639d407dd3ea81168e050ddabb09f00dff))
* **cropper:** preserve controlled geometry during automatic fitting ([07ee755](https://github.com/liunnn1994/sd-design/commit/07ee755bfe51a4c9fc6e9b42520e705b97debbdb))
* **cropper:** react to runtime selection fitting changes ([cb5a665](https://github.com/liunnn1994/sd-design/commit/cb5a665c843f413da3685ec968c348d757939db5))
* **cropper:** restore child attributes when overrides are removed ([c8445e8](https://github.com/liunnn1994/sd-design/commit/c8445e82d2a56ade501581f8cff08a6e50d41a03))
* **date-picker:** align period validation with selectable cells ([3464d17](https://github.com/liunnn1994/sd-design/commit/3464d17c2fd4f0d9d5a37d30338ee1e6d0719c1b))
* **date-picker:** guard inline selection in readonly and disabled states ([3e7b4c5](https://github.com/liunnn1994/sd-design/commit/3e7b4c5883573ecfe9c17c4a412965beb78ddeee))
* **date-picker:** preserve epoch timestamps and verify popup lifecycle ([0cb2749](https://github.com/liunnn1994/sd-design/commit/0cb27497e0865bc3a07b31d0636760f4cad9b646))
* **date-picker:** preserve range editability and disabled endpoints ([dca6b4b](https://github.com/liunnn1994/sd-design/commit/dca6b4bc35f25cfdaee79a53753eada855295715))
* **date-picker:** protect locked endpoints across range operations ([c27fec9](https://github.com/liunnn1994/sd-design/commit/c27fec9608b714af24366350fbf1e7e57ba762c5))
* **date-picker:** reset pending selection on external value changes ([09b52b5](https://github.com/liunnn1994/sd-design/commit/09b52b5b4a189ccd0b63ed0adfbc889a36c352a2))
* **date-picker:** satisfy strict prop typing ([0f9433b](https://github.com/liunnn1994/sd-design/commit/0f9433bd44e465e96a27233f8961fe2d09a80035))
* **date-picker:** validate final sorted range endpoints ([f8428a3](https://github.com/liunnn1994/sd-design/commit/f8428a3905eb79542d8d763b22fd20f3fc156bad))
* **descriptions:** preserve data indexes in scoped slots ([c29cc6d](https://github.com/liunnn1994/sd-design/commit/c29cc6d65361067ae2b4b2412fd63c3b5b563ccc))
* **divider:** honor zero size and expose separator orientation ([4fe1f06](https://github.com/liunnn1994/sd-design/commit/4fe1f06962a700864a091e293d2175b828aee81d))
* **drawer:** handle confirmation errors and dynamic title slots ([3514a46](https://github.com/liunnn1994/sd-design/commit/3514a461031b781c4adeb0d4df4713b6078c215f))
* **drawer:** invalidate pending confirmation on external close ([fa46855](https://github.com/liunnn1994/sd-design/commit/fa46855649ce40f99aaa89d8a2509ac5fc0ff9dc))
* **drawer:** release popup stack entry on unmount ([24cea32](https://github.com/liunnn1994/sd-design/commit/24cea32e783a5aa238ff66df1587558e8201d981))
* **dropdown:** focus menu items after popup becomes visible ([dd3b9c4](https://github.com/liunnn1994/sd-design/commit/dd3b9c43fe8ae094d110546803a20a4ad0501b6a))
* **dropdown:** preserve keyboard input in editable menu content ([9c41f55](https://github.com/liunnn1994/sd-design/commit/9c41f55339ebded0a4f8646f280bb295f8281a3f))
* **dropdown:** refresh dynamic options and honor submenu disabled state ([7531416](https://github.com/liunnn1994/sd-design/commit/7531416cb51fa19fcafbf0e90e6c62495791b7d3))
* **ellipsis:** avoid duplicate clicks during lazy expansion ([fcf159b](https://github.com/liunnn1994/sd-design/commit/fcf159b774f802f6314b9035e4b2415cfd22ed22))
* **ellipsis:** make lazy expansion reachable by keyboard ([ef02f6d](https://github.com/liunnn1994/sd-design/commit/ef02f6d1c3fc69ca0d5a55a0495b5cf5918d9fd2))
* **ellipsis:** observe content changes and preserve nested keyboard input ([2862527](https://github.com/liunnn1994/sd-design/commit/28625277950d1b4d24f5ae521d009c8bb611400a))
* **ellipsis:** settle measurement waiters on fallback and unmount ([f080d61](https://github.com/liunnn1994/sd-design/commit/f080d61912109e0e9d8f369223255bfe9e69d409))
* **empty:** prefer local description slot over provider fallback ([2e6fd9b](https://github.com/liunnn1994/sd-design/commit/2e6fd9bad9c0402988ae82ea481189a669912532))
* **file-previewer:** cancel obsolete PDF loads and clear empty sources ([d79326c](https://github.com/liunnn1994/sd-design/commit/d79326cfb131d79be08c0eb58223c0ae93c6277f))
* **file-previewer:** handle media load and release popup on unmount ([52e83f7](https://github.com/liunnn1994/sd-design/commit/52e83f7611230b85e7ed97428b6eae34e33da9ff))
* **file-previewer:** ignore stale PDF page render requests ([4a4623c](https://github.com/liunnn1994/sd-design/commit/4a4623c36dbb9b3c4c9dd31b4dac7548870d16a1))
* **file-previewer:** react to custom content changes and ignore stale media ([3ea07d6](https://github.com/liunnn1994/sd-design/commit/3ea07d6b3c415f06a400155015985be7b626f68c))
* **file-previewer:** release PDF resources when leaving the preview ([a883274](https://github.com/liunnn1994/sd-design/commit/a883274c13a278fd3239043095735527921e505b))
* **file-previewer:** surface PDF page rendering errors safely ([8b7f9b1](https://github.com/liunnn1994/sd-design/commit/8b7f9b1500da43224ae8980fcae000451f5b2150))
* **form:** clear nested validation state when fields unmount ([7486bc6](https://github.com/liunnn1994/sd-design/commit/7486bc657013173503a4f90247f3610c192606f9))
* **form:** preserve mutable initial values across repeated resets ([f22596e](https://github.com/liunnn1994/sd-design/commit/f22596ed038134b4e99f153468dc3ce081169b2c))
* **form:** prevent stale validation from restoring cleared errors ([8b6f53e](https://github.com/liunnn1994/sd-design/commit/8b6f53ea07e54cff3e3cd40ccee347452c4d7097))
* **form:** report custom validator exceptions and allow retry ([eff6bff](https://github.com/liunnn1994/sd-design/commit/eff6bff3b5e2ba0a1de6b11831839ddd5e058c5d))
* **form:** retain field identity in asynchronous validation results ([7c4a422](https://github.com/liunnn1994/sd-design/commit/7c4a4222fca317df091a8e3645f30b0e54ec1ff2))
* **form:** submit the values captured before asynchronous validation ([460e7bb](https://github.com/liunnn1994/sd-design/commit/460e7bbcd8b5a6e71249f14946fcab9325649dcb))
* **form:** synchronize dynamic field registration and reset state ([91c06d6](https://github.com/liunnn1994/sd-design/commit/91c06d61878f18d1c5b73a8308c62b18b89cf338))
* **grid:** allow responsive offset and order to reset to zero ([ce06db2](https://github.com/liunnn1994/sd-design/commit/ce06db26b8b3fd9bc0ba48ebce6d09284f1afb8d))
* **grid:** count row gaps in collapsed item placement ([fb50473](https://github.com/liunnn1994/sd-design/commit/fb50473469c846cdd6bed1d2f240fb2a6a3cef6a))
* **grid:** honor plain div mode across column layout options ([e017fe8](https://github.com/liunnn1994/sd-design/commit/e017fe8bc16b23c9766f197daeed4bf755afbbce))
* **grid:** preserve numeric zero flex configuration ([678417b](https://github.com/liunnn1994/sd-design/commit/678417b54f9c110711978e3dcc6ff534a23094fc))
* **grid:** retain item identity during removal and reordering ([9ea3214](https://github.com/liunnn1994/sd-design/commit/9ea3214c9eb0e78ba68865b2776967ef6ea56510))
* **icon-component:** allow retry after iconfont script failure ([281184b](https://github.com/liunnn1994/sd-design/commit/281184b3cf01e477397958e3d3637939fa29643d))
* **icon-component:** preserve zero size and compose spin rotation ([ccfac08](https://github.com/liunnn1994/sd-design/commit/ccfac08227946b3fb39d84fd3a2d483f8cdbd6fe))
* **icon:** preserve zero size in generated components ([6b94a23](https://github.com/liunnn1994/sd-design/commit/6b94a231f9331ebb6511de40da152a70283c122c))
* **image:** clear removed sources and release unmounted previews ([e729c5b](https://github.com/liunnn1994/sd-design/commit/e729c5b03fcda872276f531b6e19fd866df23b9f))
* **image:** end interrupted preview drags during image cleanup ([b3f49b9](https://github.com/liunnn1994/sd-design/commit/b3f49b981753eb4941e0326d0c99670c5c9ba5f8))
* **image:** keep explicit preview sources separate from child registrations ([f982968](https://github.com/liunnn1994/sd-design/commit/f982968e16a91efe908960a4a64e62d31d09bc53))
* **image:** keep preview group child identities unique ([8f4d325](https://github.com/liunnn1994/sd-design/commit/8f4d325fc59ed73d9064fdcaa4560edd4f0f8277))
* **image:** preserve group order when child sources change ([cc3fa0c](https://github.com/liunnn1994/sd-design/commit/cc3fa0c3840afe12530369cc4ee41c0b145acc33))
* **image:** refresh preview keyboard listeners on configuration changes ([d91e8eb](https://github.com/liunnn1994/sd-design/commit/d91e8ebf65b132c399a301732dceeda461ae485e))
* **image:** suppress clicks on disabled preview actions ([d019a7e](https://github.com/liunnn1994/sd-design/commit/d019a7ea3eae12d5b662111ef5eecc61f1f32df9))
* **input-mask:** derive completion from callback results ([5c0b2f7](https://github.com/liunnn1994/sd-design/commit/5c0b2f7ebe96d91bc9a0f473211df9870f4c8772))
* **input-mask:** preserve complete placeholder graphemes ([c253713](https://github.com/liunnn1994/sd-design/commit/c253713d64b5b32b96e531335168cb1629fbdb62))
* **input-mask:** strip old placeholders before mask changes ([104145f](https://github.com/liunnn1994/sd-design/commit/104145fda4fc7bb056ca1e91b35789eeb1c69280))
* **input-mask:** treat placeholder-only masks as empty ([bf74c3c](https://github.com/liunnn1994/sd-design/commit/bf74c3c717733ea3dcf5bde6f2cfe08637640ca5))
* **input-number:** apply precision directly to decimal strings ([9d4b3f2](https://github.com/liunnn1994/sd-design/commit/9d4b3f20ea4ed74b8d560f901c2fe719183e86cc))
* **input-number:** compare string values against exact numeric bounds ([cdeff7c](https://github.com/liunnn1994/sd-design/commit/cdeff7c0e961d93115bd2046a5caa511000f7668))
* **input-number:** expose numeric and formatted accessible values ([3b9fa45](https://github.com/liunnn1994/sd-design/commit/3b9fa453b1490aa5e7317e5d538d1dacaca2f141))
* **input-number:** preserve controlled decimal strings and change identity ([fa5c8eb](https://github.com/liunnn1994/sd-design/commit/fa5c8eb72d99562495055d4df6088c363d492090))
* **input-number:** preserve decimal digits during string mode stepping ([7f54fe2](https://github.com/liunnn1994/sd-design/commit/7f54fe27cf332ee14586de54ad343d7d5b4aa489))
* **input-number:** preserve explicit bounds after precision rounding ([ba3a4a5](https://github.com/liunnn1994/sd-design/commit/ba3a4a5d4a33cd00037ca04662d34c47c20d632f))
* **input-number:** refresh display when formatting callbacks change ([2271603](https://github.com/liunnn1994/sd-design/commit/2271603a7fc820e75d3d6c4ac3d3f20f48da5ee0))
* **input-number:** restore clearing commits and step availability ([65eb5e0](https://github.com/liunnn1994/sd-design/commit/65eb5e0fa5533381d79e77a9f083ed5422cbdfc1))
* **input-number:** retain scientific notation step precision ([5a2be3a](https://github.com/liunnn1994/sd-design/commit/5a2be3a9a8d87da5922cd4a1cb6eb9c2ef65db5e))
* **input-number:** synchronize rounded boundaries and clamp initial steps ([b139d6c](https://github.com/liunnn1994/sd-design/commit/b139d6c1b7c4c167bd484c35f8faf9c9d505debe))
* **input-tag:** enforce unique values for mapped object tags ([a69bb5c](https://github.com/liunnn1994/sd-design/commit/a69bb5c4ba350fa7b0ccde99a90a49136668b675))
* **input-tag:** honor effective closability for all removal paths ([44ba5b6](https://github.com/liunnn1994/sd-design/commit/44ba5b6a623ce762049e7f91d6c7a503d02dd8e6))
* **input-tag:** synchronize initial drafts and preserve layout focus ([c347a78](https://github.com/liunnn1994/sd-design/commit/c347a78c348a5e200f84ae05b28c2db0f41beba6))
* **input:** compare committed changes against the editing baseline ([d072b1f](https://github.com/liunnn1994/sd-design/commit/d072b1f73bd0771a96bf8304ce2287a0a8d3bec0))
* **input:** emit the accepted value after length truncation ([b428f8f](https://github.com/liunnn1994/sd-design/commit/b428f8f60314c5a5956d763a9bd0cb1b4739fcc8))
* **input:** prevent searches from disabled input icons ([1ba26e0](https://github.com/liunnn1994/sd-design/commit/1ba26e05d09f70c36e6b77a04b23126324680caa))
* **json-form:** block prototype traversal in form paths ([2ef18e0](https://github.com/liunnn1994/sd-design/commit/2ef18e029de8f1daa11629a0a001cfc42c6b9a77))
* **json-form:** decode pointer escapes for field validation ([8f073d7](https://github.com/liunnn1994/sd-design/commit/8f073d763d45c081fdf4e70db641f5e87cb773ad))
* **json-form:** forward component slots by their actual names ([c88e3b7](https://github.com/liunnn1994/sd-design/commit/c88e3b7766c6fc24beda24f19be965b573b4c15e))
* **json-form:** preserve explicit empty placeholder overrides ([bb233ff](https://github.com/liunnn1994/sd-design/commit/bb233ffcf57b1d5dcb989be2895bd1c8d5208aeb))
* **json-form:** preserve literal pointer keys in validation and reset ([02c439d](https://github.com/liunnn1994/sd-design/commit/02c439d9a18f2abd4740964d22cd73afdf57bac6))
* **kv-list:** preserve spaces and focus during list editing ([6cea742](https://github.com/liunnn1994/sd-design/commit/6cea742bb8293b4166cd7c2d3435ad956759fef0))
* **layout:** reset sider responsive and hover state on toggle ([15b428d](https://github.com/liunnn1994/sd-design/commit/15b428d9301898082f46490e90ad87c2794824a1))
* **menu:** react to breakpoint changes ([6f888b6](https://github.com/liunnn1994/sd-design/commit/6f888b6a8146f969ffebaa54550a181ca446e410))
* **menu:** refresh overflow after content changes ([d735e39](https://github.com/liunnn1994/sd-design/commit/d735e39ea974fda92d948825584212c66a40347d))
* **message:** clear stale message ids ([96cdc89](https://github.com/liunnn1994/sd-design/commit/96cdc89d2c2353558b9770688bb19ec2ebba9329))
* **modal:** clean up active drag listeners ([ad2a86b](https://github.com/liunnn1994/sd-design/commit/ad2a86b86549d9c2132357c13e1b75f5927eb505))
* **notification:** expose remove in plugin API ([c343b81](https://github.com/liunnn1994/sd-design/commit/c343b81464899771e1ddfbbebc4c8e0b4e3c90f1))
* **page-header:** refresh dynamic slot classes ([52d4ac5](https://github.com/liunnn1994/sd-design/commit/52d4ac56ad73cc06b57dade56414104907219e77))
* **pagination:** honor configured auto adjust ([989d108](https://github.com/liunnn1994/sd-design/commit/989d10858e44d09198a0534ff5ad7779a2bc2913))
* **progress:** restore animation and reactive rendering ([92f28b7](https://github.com/liunnn1994/sd-design/commit/92f28b79e0513b095b9927e0d6cd9e335513617a))
* **qr-code:** ignore stale async renders ([6f99d49](https://github.com/liunnn1994/sd-design/commit/6f99d497e10fd18a4df8afe1dc83780f9cf9e755))
* **rate:** correct radio selection semantics ([a82fcef](https://github.com/liunnn1994/sd-design/commit/a82fcef128d232bf6f21573f80414e79b776980d))
* **release:** run package builds with TypeScript 5 ([85ecef9](https://github.com/liunnn1994/sd-design/commit/85ecef9bd4f83576ccdff7a6f70fcb970e1493f0))
* **resize-box:** clean up active drag on unmount ([6e15532](https://github.com/liunnn1994/sd-design/commit/6e15532a4b544e533c4cb19d4afb268fe6fae538))
* **result:** export status type ([6df771f](https://github.com/liunnn1994/sd-design/commit/6df771f5b47254a10f341558b915c03119a38dd5))
* **secret:** localize toggle tooltip ([92eb17e](https://github.com/liunnn1994/sd-design/commit/92eb17ea8bab6f692b4668e8791267bb95a91e36))
* **select:** honor form disabled clear state ([1b020a5](https://github.com/liunnn1994/sd-design/commit/1b020a5426331ac34c27f3d7b04d1025f594739d))
* **select:** scroll active option into view ([4c323ef](https://github.com/liunnn1994/sd-design/commit/4c323ef068e44f2fae3f014135fff6801f40ffa6))
* **skeleton:** render rows in one list ([62216c9](https://github.com/liunnn1994/sd-design/commit/62216c9bdef67e98c44c94ffe3daa731c66e05ef))
* **slider:** clean up drag state and zero values ([a6d3fb3](https://github.com/liunnn1994/sd-design/commit/a6d3fb31175252620534a5b98a997de0f92454d2))
* **spin:** expose active busy state ([5614da2](https://github.com/liunnn1994/sd-design/commit/5614da2251e480346a7c6673192af795d9e2ea30))
* **split:** clean up active resize listeners ([387856e](https://github.com/liunnn1994/sd-design/commit/387856e5807630eb7d637e1e2203a87f63a01a34))
* **statistic:** restart updated countdown ([85540b5](https://github.com/liunnn1994/sd-design/commit/85540b5ec3a2b949c090a54f408b6c263362c500))
* **steps:** expose disabled semantics ([f44a82a](https://github.com/liunnn1994/sd-design/commit/f44a82aef81c363342bc4d8f3837c8b63697606a))
* **switch:** announce loading state ([066df55](https://github.com/liunnn1994/sd-design/commit/066df55bcc939e2c7ecb59f3e56674c7f4cfd2bb))
* **table:** support keyboard sorting ([90b20a3](https://github.com/liunnn1994/sd-design/commit/90b20a3a5b81e37c38e3fdd484b5e50801bb37d3))
* **tabs:** make nav controls accessible ([d7aa8b5](https://github.com/liunnn1994/sd-design/commit/d7aa8b55448472d16159c916443922b62598802c))
* **tag-group:** focus overflow counter ([1f0c290](https://github.com/liunnn1994/sd-design/commit/1f0c290ad38ad701c6c72c19bfc1db71a9acd8f0))
* **textarea:** react to native attrs ([c70e9d0](https://github.com/liunnn1994/sd-design/commit/c70e9d048d72e791717d603f159ee6c30f58f3fd))
* **toolbar:** avoid duplicate enter actions ([a585230](https://github.com/liunnn1994/sd-design/commit/a585230725d6798e91700802f724013e28105a7a))
* **tooltip:** show help on keyboard focus ([5f2043e](https://github.com/liunnn1994/sd-design/commit/5f2043ef033f69f64a66d6a4a899a52c408c7736))
* **tour:** preserve arrow keys in editors ([9655c61](https://github.com/liunnn1994/sd-design/commit/9655c61efdad0ab8e2405baf1c5220a669794dc1))
* **transfer:** restore keyboard move controls ([ed645a3](https://github.com/liunnn1994/sd-design/commit/ed645a37955c6ae7f3df0e65c01e43ebc6f67c3b))
* **tree-select:** describe tree popup semantics ([3dbc4a6](https://github.com/liunnn1994/sd-design/commit/3dbc4a6530a9819818dccf41641aac75310e668f))
* **tree:** recover tab stop after data changes ([dfb80c2](https://github.com/liunnn1994/sd-design/commit/dfb80c2771ef8cd997f19e6a4046375dd6c8ff30))
* **trigger:** sync scroll listener lifecycle ([e4aa14b](https://github.com/liunnn1994/sd-design/commit/e4aa14b7f8abc38c40e493a39a68677735f615ac))
* **typography:** preserve IME editing ([fe4c9ce](https://github.com/liunnn1994/sd-design/commit/fe4c9cedfd96c9d96e405612bfa07c97fe32317a))
* **upload:** enable keyboard file actions ([1a096df](https://github.com/liunnn1994/sd-design/commit/1a096df79d870a5a6448b3ebcc5e2283ce66b863))
* **utils:** cancel debounced work on unmount ([ec891df](https://github.com/liunnn1994/sd-design/commit/ec891dfbfeef6bdd055a2e40865bc910b3b1673a))
* **verification-code:** react to length changes ([1ea2c1b](https://github.com/liunnn1994/sd-design/commit/1ea2c1b773142af9f2f0f8237d69384aa08cd9b5))
* **watermark:** ignore stale image renders ([aedd50d](https://github.com/liunnn1994/sd-design/commit/aedd50da99fa3663e52e6b1ef678935cd6d32220))

# [4.5.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.4.3...web-vue-v4.5.0) (2026-09-09)

### Features

- 🆕 优化 tab 切换卡顿的问题 ([0b797c6](https://github.com/liunnn1994/sd-design/commit/0b797c605ec974ff530261a73009da14019161cc))

## [4.4.3](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.4.2...web-vue-v4.4.3) (2026-09-09)

### Bug Fixes

- 🐛 empty ConfigProvider 自定义分支透传 attrs ([44d8612](https://github.com/liunnn1994/sd-design/commit/44d86128263445df306cbde05350a636453b267b))

## [4.4.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.4.1...web-vue-v4.4.2) (2026-09-08)

### Bug Fixes

- 🐛 gen-icons faceBook 命名归一化；更新审计台账 ([f6c9e0e](https://github.com/liunnn1994/sd-design/commit/f6c9e0e58f3114dc1db0a6b9367a5bf7d91327b7))
- 🐛 修复 grid/ellipsis 审计问题 ([c1b71af](https://github.com/liunnn1994/sd-design/commit/c1b71af2d7f4c9db58594d9ebfa3c0004a67107c))
- 🐛 修复 transfer/upload/tree-select 审计问题 ([3d24680](https://github.com/liunnn1994/sd-design/commit/3d246807c1ce09c4655d9184a043bec11e7dbff1))
- 🐛 修复交互工具审计问题（resize-box/split/slider/spin/cropper/copy/border-beam/typography/bloom-menu） ([c49ceb2](https://github.com/liunnn1994/sd-design/commit/c49ceb21246c1c6a9f4531449026f9ce55f066a7))
- 🐛 修复反馈弹层审计问题（modal/drawer/popconfirm/notification/message） ([a36346f](https://github.com/liunnn1994/sd-design/commit/a36346fdb7d64c1f2a7edc7a7d57865fdfc90b4a))
- 🐛 修复基础配置审计问题（model-selector/empty/config-provider/color-picker/file-previewer/global-config/icon） ([e5c6c31](https://github.com/liunnn1994/sd-design/commit/e5c6c317c19e5bbe1b70afbe6f5b6eed192f0106))
- 🐛 修复布局导航审计问题（watermark/qr-code/skeleton/result/layout/anchor/breadcrumb/pagination/carousel） ([535e33b](https://github.com/liunnn1994/sd-design/commit/535e33b900f99bdb36b0911f1dc208f3d061d8d8))
- 🐛 修复弹层触发审计问题（tour/trigger/popover/dropdown） ([99ed53f](https://github.com/liunnn1994/sd-design/commit/99ed53fbfde72c607fc98bc30e1a699e534aa129))
- 🐛 修复数据展示审计问题（avatar/badge/tag/list/comment/kv-list/statistic/timeline/number-flow/page-header） ([8f294db](https://github.com/liunnn1994/sd-design/commit/8f294dbd33633d183ca6687eb283e15ba22701c6))
- 🐛 修复数据展示审计问题（image/table/calendar） ([65d9937](https://github.com/liunnn1994/sd-design/commit/65d9937f0e037aa61ad805fc7114aeb8df0ee34f))
- 🐛 修复表单审计问题（form/json-form） ([4084c50](https://github.com/liunnn1994/sd-design/commit/4084c50d7ebb5f2737c8af480a96730666b9df2c))
- 🐛 修复输入类组件审计问题 ([b34c570](https://github.com/liunnn1994/sd-design/commit/b34c570b0cbad98e4feb35cdb0fcd6f319d817a0))
- 🐛 修复选择类组件审计问题（select/cascader/auto-complete/mention） ([256104b](https://github.com/liunnn1994/sd-design/commit/256104befd0ce7d3449a9f858ddcd3401b0dd079))
- 🐛 稳定 CI 下的测试断言（popover/split/radio/ellipsis/table/date-picker） ([b0dbcf3](https://github.com/liunnn1994/sd-design/commit/b0dbcf36b71fe5abf13cdde32c5d21b470d1b63a))

## [4.4.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.4.0...web-vue-v4.4.1) (2026-09-07)

### Bug Fixes

- 🐛 button 点击守卫未使用 mergedDisabled ([061e9fe](https://github.com/liunnn1994/sd-design/commit/061e9fe1e40a596d99814d9aff3bbeb5ffdc9c49))
- 🐛 icongen 重新生成时保留受版本控制的 icon **test** 目录 ([2aff61f](https://github.com/liunnn1994/sd-design/commit/2aff61f25f04aac29ee9b7761082b133a29eda41))
- 🐛 table Td/Th 组件丢失透传的事件监听 ([95045f8](https://github.com/liunnn1994/sd-design/commit/95045f8ff0b0335c71ef0414f7af86d3f1c4105a))
- 🐛 theme-provider 卸载时释放弹层栈 zIndex ([a6201aa](https://github.com/liunnn1994/sd-design/commit/a6201aadc6b6121ddd4d7861830ea2333dfeb402))
- 🐛 tree onDragOver 判断 draggable 时遗漏 .value ([c5509b8](https://github.com/liunnn1994/sd-design/commit/c5509b8aff57a44f735507490288647c2ec8c55c))
- 🐛 upload 文件类型判断使用最后一个扩展名 ([6cc2a65](https://github.com/liunnn1994/sd-design/commit/6cc2a65a04d896ea13fd8b63692605a1dce3345b))
- 🐛 修复 date-picker 范围选择器头部操作误判 isDateOrWeek ([47c9b60](https://github.com/liunnn1994/sd-design/commit/47c9b600c089e908c1b459d8cc114ffb3861f3b8))

# [4.4.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.3.1...web-vue-v4.4.0) (2026-09-01)

### Bug Fixes

- 🐛 修复容器不可点击的问题 ([b1c7af2](https://github.com/liunnn1994/sd-design/commit/b1c7af2065b73db463057c13d51836b719d502ad))

### Features

- 🆕 新增正则可视化组件 ([ebe6901](https://github.com/liunnn1994/sd-design/commit/ebe6901a49f15a17944ab9ac65d35cba19758efc))
- 🆕 根据设计规范优化组件 ([522d2ac](https://github.com/liunnn1994/sd-design/commit/522d2ac961626718ffd75b900c51003b8d248cbf))

## [4.3.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.3.0...web-vue-v4.3.1) (2026-08-28)

### Bug Fixes

- 🐛 修复报错 TS18048 ([b4c221a](https://github.com/liunnn1994/sd-design/commit/b4c221a31bf7800e81a12489804a4cc1c2b00aca))

# [4.3.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.2.0...web-vue-v4.3.0) (2026-08-27)

### Features

- 🆕 新增 clamp 组件并且所有涉及到内容裁剪的组件底层都切换为 vue-clamp ([ebdf802](https://github.com/liunnn1994/sd-design/commit/ebdf80274cf5457160791b0292864c4e4aded655))

# [4.2.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.1.0...web-vue-v4.2.0) (2026-08-19)

### Bug Fixes

- 🐛 修复错误的类型 ([7ce3d69](https://github.com/liunnn1994/sd-design/commit/7ce3d695c4e94e51a35775959d42e1afeea31d7d))
- 🐛 修复错误的类型推断 ([fb2432b](https://github.com/liunnn1994/sd-design/commit/fb2432b1598d5722c0679a8af3dd5f311166cafb))

### Features

- 🆕 新增 BloomMenu 组件 ([1f44584](https://github.com/liunnn1994/sd-design/commit/1f445841c1fc9a63e2d249cd90bd7f6929fdb206))

# [4.1.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.0.0...web-vue-v4.1.0) (2026-08-13)

### Features

- 🆕 Badge和Statistic使用新的动画组件 ([a99934d](https://github.com/liunnn1994/sd-design/commit/a99934dc68cd2bb49ad7b5a4b72cf3c0b8941ec6))
- 🆕 新增数字动效组件 ([0867813](https://github.com/liunnn1994/sd-design/commit/0867813ecb257e69715d7791e3119c48e44750f7))

# [4.0.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.30.0...web-vue-v4.0.0) (2026-08-13)

### Bug Fixes

- 🐛 preserve spin root attributes ([fed2b5f](https://github.com/liunnn1994/sd-design/commit/fed2b5f37657b50f39435e3ac4f9dd83347b08fd))
- 🐛 修复 grid 示例以及样式错误 ([c81d9f1](https://github.com/liunnn1994/sd-design/commit/c81d9f13d1e36e8542fd169d065ca3c7958890eb))
- 🐛 修复 select 传入 class 时丢失 sd-select 类名 ([22d835e](https://github.com/liunnn1994/sd-design/commit/22d835e1759830b189b8c846d18864118db3b03a))
- 🐛 修复 slider 组件中 tooltip 位置错误的问题 ([c4ade36](https://github.com/liunnn1994/sd-design/commit/c4ade36cf163f68a6502dcf70a4079be29753b8e))
- 🐛 修复 upload 组件 ([95852e8](https://github.com/liunnn1994/sd-design/commit/95852e8a46169271230a7312af08367851113597))
- **cascader:** avoid transition root warning ([4d7bc80](https://github.com/liunnn1994/sd-design/commit/4d7bc808dcabd134a039a7f73a0b51b20ee097b9))
- **docs:** mount type enhancer without hydration ([ea25389](https://github.com/liunnn1994/sd-design/commit/ea253891f3d19ad464e60cd29e509333e36a3959))
- **icon:** export icon font props type ([e9fee10](https://github.com/liunnn1994/sd-design/commit/e9fee10ddc9806b8a0025336876b901f8c3683ba))
- **menu:** avoid forwarding overflow bindings ([c334f12](https://github.com/liunnn1994/sd-design/commit/c334f12cd7dca5580810d31138474e9002c99bf3))
- **timeline:** preserve spinProps size override for pending dot ([f324f11](https://github.com/liunnn1994/sd-design/commit/f324f1186216b6dfa038e9f264c905886c00bef2))
- **tree:** keep switcher hidden for plain leaves in node-switcher ([8173e7e](https://github.com/liunnn1994/sd-design/commit/8173e7e5c9af9d632c4a2e917551dbfb89ac599d))
- **tree:** widen node-switcher computed types to VNodeChild ([62a2a03](https://github.com/liunnn1994/sd-design/commit/62a2a03aca69f5b1d67e3a85b44c8c471c7b1e74))
- **typography:** capture all operation nodes in ellipsis measure ([50d410b](https://github.com/liunnn1994/sd-design/commit/50d410bec24098d4347d00dbb7bac95a38312413))
- 修复 OverflowList 示例宽度控制 ([2227863](https://github.com/liunnn1994/sd-design/commit/2227863daec3282f4ffef314bc0d0f5d2d6ca493))
- 修复 Popconfirm 异步关闭示例 ([dd137e0](https://github.com/liunnn1994/sd-design/commit/dd137e08a479429c5bcf3c0974a11d0a7bb7fa63))
- 修复 Radio 非受控交互 ([bba3e64](https://github.com/liunnn1994/sd-design/commit/bba3e64e47269c47f31b9f30f82d6d1e88be7dfa))
- 修复 Slider 百分比精度警告 ([dd724b7](https://github.com/liunnn1994/sd-design/commit/dd724b7aabe04fd86d843081c5b8367e191fafeb))
- 修复 Space 子组件重复挂载 ([ff3e3ce](https://github.com/liunnn1994/sd-design/commit/ff3e3ce40c990da7b3c5242a031e4b5a3c03ae16))
- 修复 TagGroup 示例连续拖拽 ([34be853](https://github.com/liunnn1994/sd-design/commit/34be8536f697a726b532d3d8eb0c707c5001808b))
- 修复 Upload 列表过渡警告 ([12eff88](https://github.com/liunnn1994/sd-design/commit/12eff88e804af6a45583456ec4be5d612fa4f6a7))
- 修复时间选择器当前时间文案 ([da675c0](https://github.com/liunnn1994/sd-design/commit/da675c0469d95010232dd25d4d4aea6bfc73177c))
- 修复输入示例失焦 ([47bba36](https://github.com/liunnn1994/sd-design/commit/47bba369713fb57de54bfa736cdb724765efa8f0))

### Features

- 🆕 tooltip 组件新增鼠标穿透功能 ([f739e78](https://github.com/liunnn1994/sd-design/commit/f739e7831cdad4dd81cab8b0abd7af3b02ac8784))
- 🆕 移除废弃的 overflow-list 组件 ([ca1ad0d](https://github.com/liunnn1994/sd-design/commit/ca1ad0d54bb827203a47057f1e6e13c5d521d780))
- 🆕 避免文本超出范围 ([899c450](https://github.com/liunnn1994/sd-design/commit/899c450c0df37069b632dbd7f20a571c03c489a2))

### BREAKING CHANGES

- 🧨 OverflowList 现已不可用

# [3.30.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.29.0...web-vue-v3.30.0) (2026-08-07)

### Bug Fixes

- 🐛 修复 ts 报错 ([7346a3e](https://github.com/liunnn1994/sd-design/commit/7346a3e8e62cfde46fdbecbc03c7e031f3d6095b))

### Features

- 🆕 JsonForm 添加 inputMask 支持 ([58b2c41](https://github.com/liunnn1994/sd-design/commit/58b2c41fcce6cd7b3b82995501314cf398247bbb))

# [3.29.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.28.0...web-vue-v3.29.0) (2026-08-06)

### Features

- 🆕 crud 组件新增 action_middle slot ([7553a9d](https://github.com/liunnn1994/sd-design/commit/7553a9d0d599213544ff7867c377cd4cd31c5ab7))
- 🆕 新增开始按钮的显隐 ([6d8c12d](https://github.com/liunnn1994/sd-design/commit/6d8c12de93835bd9ecd2bfa1c9d55659a69540c4))

# [3.28.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.27.0...web-vue-v3.28.0) (2026-08-06)

### Bug Fixes

- 🐛 修复错误的样式 ([2798b88](https://github.com/liunnn1994/sd-design/commit/2798b88d313fb75461f1f1a2331e2951c2f327dd))

### Features

- 🆕 新增 InputMask 组件 ([bafc2ea](https://github.com/liunnn1994/sd-design/commit/bafc2ea04a3ae966c1a8ffdf7d2f00e2d8cd5a1d))
- 🆕 给crud的按钮/link添加props ([54b3fc3](https://github.com/liunnn1994/sd-design/commit/54b3fc36363079685ed5ac36a765f06cb4f587f2))

# [3.27.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.26.0...web-vue-v3.27.0) (2026-08-05)

### Features

- 🆕 新增思考球组件 ([f046d1e](https://github.com/liunnn1994/sd-design/commit/f046d1e9317d0a5dded6212efdb933077862a384))
- 🆕 移除不再维护的语言，仅保留简体中文和英文 ([67c63d3](https://github.com/liunnn1994/sd-design/commit/67c63d379f5a8aeeba461665b6403b6e9908a19d))

# [3.26.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.25.0...web-vue-v3.26.0) (2026-07-30)

### Features

- 🆕 更新 mcp，支持 `2026-07-28` 协议并兼容旧版握手 ([7c85920](https://github.com/liunnn1994/sd-design/commit/7c85920aa50302452238cefc132d325b40a1df48))

# [3.25.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.24.1...web-vue-v3.25.0) (2026-07-30)

### Features

- 🆕 模型选择器组件新增自定义触发器功能 ([db7265c](https://github.com/liunnn1994/sd-design/commit/db7265ceef65566b08452788867120878eb8c305))

## [3.24.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.24.0...web-vue-v3.24.1) (2026-07-30)

### Bug Fixes

- 🐛 修复深色模式没有适配的问题 ([e55a0ba](https://github.com/liunnn1994/sd-design/commit/e55a0ba9dafc8e3bb724614b62cd119f7ba4b262))

# [3.24.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.23.0...web-vue-v3.24.0) (2026-07-29)

### Bug Fixes

- 🐛 修复富文本编辑器潜在的性能问题 ([86560da](https://github.com/liunnn1994/sd-design/commit/86560da938ccd265d08b0b48f9de21d348005d5a))
- 🐛 由于 recorder-core 的类型都是 any，在这添加一个兜底的类型避免警告 ([0a60ee3](https://github.com/liunnn1994/sd-design/commit/0a60ee37b5ceddd185655b28f737a5067d722e93))

### Features

- 🆕 新增模型选择组件 ([c267ad8](https://github.com/liunnn1994/sd-design/commit/c267ad866fd7b024830dfe8c4275c11cb58eac52))

# [3.23.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.22.3...web-vue-v3.23.0) (2026-07-29)

### Features

- 🆕 使用 recorder-core 替换自封装的逻辑 ([2997598](https://github.com/liunnn1994/sd-design/commit/2997598412a40da4324dd80b6eeb8c78daf3fc98))

## [3.22.3](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.22.2...web-vue-v3.22.3) (2026-07-29)

### Bug Fixes

- 🐛 修复卡死渲染进程的问题 ([de3f9cc](https://github.com/liunnn1994/sd-design/commit/de3f9cc787338442e1acb3659387b3d9de018295))

## [3.22.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.22.1...web-vue-v3.22.2) (2026-07-29)

### Bug Fixes

- 🐛 修复 AudioWorklet 互斥的问题 ([e35a8cd](https://github.com/liunnn1994/sd-design/commit/e35a8cd341531912580507a7c7a22836ab2335e3))

## [3.22.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.22.0...web-vue-v3.22.1) (2026-07-29)

### Bug Fixes

- 🐛 修复 AudioContext 没有复用导致卡死的问题 ([3493b78](https://github.com/liunnn1994/sd-design/commit/3493b788d9baa3c8d3089170503ca39f20d08764))

# [3.22.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.21.0...web-vue-v3.22.0) (2026-07-28)

### Features

- 🆕 为下拉组件添加 ellipsis 支持 ([6e57eab](https://github.com/liunnn1994/sd-design/commit/6e57eaba60693b7f2091bbd989a0162b697ab9d3))

# [3.21.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.20.0...web-vue-v3.21.0) (2026-07-28)

### Features

- 🆕 Cascader、TimePicker、ColorPicker、DatePicker 全系列添加自定义元素功能 ([e39d9c2](https://github.com/liunnn1994/sd-design/commit/e39d9c241ecc55e82b2955ceda74491ff0c84a72))
- 🆕 移除package.json中的版本号，由tag决定版本 ([832310c](https://github.com/liunnn1994/sd-design/commit/832310c41d38c39196be161cf156cb6e61acf01f))

# [3.20.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.19.0...web-vue-v3.20.0) (2026-07-28)

### Features

- 🆕 spin 添加 delay 参数 ([35b4c32](https://github.com/liunnn1994/sd-design/commit/35b4c32398cfe98610c6d86524a7f9fe5e963748))
- 🆕 不再支持浏览器自带的语音识别，改为语音采集 ([57f04c5](https://github.com/liunnn1994/sd-design/commit/57f04c5dc53399fefe23f51e5c0889bb49f10b71))
- 🆕 新增定义 suffix 位置的功能 ([3c37fa5](https://github.com/liunnn1994/sd-design/commit/3c37fa5c5ec75b702eee7c6e02cae4157c01796a))

# [3.19.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.18.0...web-vue-v3.19.0) (2026-07-27)

### Bug Fixes

- 🐛 修复 sender 构建 dts 时的 TS2883 错误 ([f1d5759](https://github.com/liunnn1994/sd-design/commit/f1d57591c9ee49a641e4cf341d3f34afe0a28daa))

### Features

- 🆕 sender 词槽模式使用组件库的富文本编辑器 ([44f4d5d](https://github.com/liunnn1994/sd-design/commit/44f4d5dce7f1bec01179b6220bcd6962cc507a46))
- 🆕 新增 sender 组件 ([21ebb9a](https://github.com/liunnn1994/sd-design/commit/21ebb9a4dd7fa72f9229c312c8b3f93c9086fc66))
- 🆕 新增fit-width属性 ([6684697](https://github.com/liunnn1994/sd-design/commit/6684697fc9964cf4c6c4c03d940993be2610b7ce))
- 🆕 新增富文本编辑器 ([5844f8b](https://github.com/liunnn1994/sd-design/commit/5844f8be3c81b43bdbcad38d4f1ade016a8aba3a))

# [3.18.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.17.0...web-vue-v3.18.0) (2026-07-24)

### Features

- 🆕 a2ui协议更新到 0.9.1 ([d987ff0](https://github.com/liunnn1994/sd-design/commit/d987ff02fa613c9bb5b351b264c1f10a7eacfddc))
- 🆕 悬浮组件底层改为 floating-ui 实现 ([e0f0ee8](https://github.com/liunnn1994/sd-design/commit/e0f0ee8d8d4ed83997d8a3c92c2bf62e94192da3))

# [3.17.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.16.1...web-vue-v3.17.0) (2026-07-23)

### Bug Fixes

- 🐛 修复 ts 报错 ([306a21d](https://github.com/liunnn1994/sd-design/commit/306a21db3aa375ae67284975ed254167881ba459))
- 🐛 修复下拉没有数据的时候错误的展现形式 ([f01f59a](https://github.com/liunnn1994/sd-design/commit/f01f59aa7773025cf267c173b68ce2c46148b4b0))

### Features

- 🆕 按钮组件添加屏幕阅读器兼容 ([d978d9a](https://github.com/liunnn1994/sd-design/commit/d978d9aab9237d0a85bfa8368c015f399d66264a))
- 🆕 添加 kv-list 组件 ([aae5a79](https://github.com/liunnn1994/sd-design/commit/aae5a79b92d222c59a92ba1cdaf5e641d5b58057))

## [3.16.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.16.0...web-vue-v3.16.1) (2026-07-20)

### Bug Fixes

- 🐛 修复 crudTable 中没有读取全局配置的问题 ([0274010](https://github.com/liunnn1994/sd-design/commit/0274010224e9d42ea027e5eafb68ad9f8881adf6))
- 🐛 修复页码选择可清空的bug ([23b480c](https://github.com/liunnn1994/sd-design/commit/23b480c58f17e8ec68a1288c65d9d06d3c6951d7))

# [3.16.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.15.0...web-vue-v3.16.0) (2026-07-20)

### Bug Fixes

- 🐛 修复错误的组件引用 ([bb97a05](https://github.com/liunnn1994/sd-design/commit/bb97a05a57d49cba38af62670f22bd51dfa66e08))

### Features

- 🆕 crud table 添加 fullheight 参数 ([48b39dc](https://github.com/liunnn1994/sd-design/commit/48b39dc2fd125f096ded118c006337d538525052))
- 🆕 为 colorPicker 添加全局配置 ([bbad681](https://github.com/liunnn1994/sd-design/commit/bbad6819541ff9a3db09f2a4af0680887d3f6f26))

# [3.15.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.14.0...web-vue-v3.15.0) (2026-07-18)

### Bug Fixes

- 🐛 修复 resize-box padding 测试与 ResizeObserver 的竞态 ([88e260b](https://github.com/liunnn1994/sd-design/commit/88e260bcb78e88fdd0ad60aa086b3858ee0cd4c6))

### Features

- 🆕 完善 a11y ([308c01a](https://github.com/liunnn1994/sd-design/commit/308c01a0482ee26a1de407270e75e812c9c1db34))
- 🆕 新增 demo，修复测试用例 ([44cab60](https://github.com/liunnn1994/sd-design/commit/44cab607bff12f6e1ef67d9396c82c201291b836))
- 🆕 新增基础增删改查组件 ([832d622](https://github.com/liunnn1994/sd-design/commit/832d622511e854f1ac74010fd5d58701fd832dce))

# [3.14.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.13.0...web-vue-v3.14.0) (2026-07-18)

### Bug Fixes

- 🐛 修复 Button fragment 根导致的 attrs 丢失与 ResizeObserver 崩溃 ([57823ed](https://github.com/liunnn1994/sd-design/commit/57823ed652a90d1eb415d2b91aa1e26dc0be47f0))

### Features

- 🆕 优化动画效果以及性能 ([d0f821c](https://github.com/liunnn1994/sd-design/commit/d0f821c41eda87bf72f387c39d56ddb624b1f7b4))
- 🆕 新增 a11y 支持 ([5d60d33](https://github.com/liunnn1994/sd-design/commit/5d60d332ecb7b86397e5599213611ac4d45310f4))
- 🆕 根据苹果设计原则优化按钮 ([abbc1ba](https://github.com/liunnn1994/sd-design/commit/abbc1badab9064b93614ebbb72c6d028dd525b31))

# [3.13.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.12.0...web-vue-v3.13.0) (2026-07-16)

### Features

- 🆕 按钮添加 tooltip ([e8785b9](https://github.com/liunnn1994/sd-design/commit/e8785b95e7009139f62ec2605e8ba35416a83e21))
- 🆕 操作型组件添加 readonly ([930bd7d](https://github.com/liunnn1994/sd-design/commit/930bd7d0c39d11084c6a5bed1a571894c69fce00))
- 🆕 更新 scrollbar 样式，添加系统级样式 ([94e8404](https://github.com/liunnn1994/sd-design/commit/94e8404b6a6fa14af280787d562381bdf141998e))
- 🆕 给 card 和 tabs 添加 fullHeight 属性 ([d7430b4](https://github.com/liunnn1994/sd-design/commit/d7430b4376056eaf13fe7860cd78f4de845b9e66))

# [3.12.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.11.0...web-vue-v3.12.0) (2026-07-15)

### Features

- 🆕 autoHideSuspend 默认设置为 false ([8ead4b5](https://github.com/liunnn1994/sd-design/commit/8ead4b5aa0ec8f44fdc383fde2699effd73a8703))

# [3.11.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.10.0...web-vue-v3.11.0) (2026-07-15)

### Features

- 🆕 新增可选择卡片组件 ([83a7113](https://github.com/liunnn1994/sd-design/commit/83a7113f253692e17fcbf900ffdd2a5a4cd70693))

# [3.10.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.9.0...web-vue-v3.10.0) (2026-07-14)

### Features

- 🆕 tree 组件添加隐藏 switcher 的参数 ([9d11b28](https://github.com/liunnn1994/sd-design/commit/9d11b288c94251753dbc17344ddaa0b12dbd6a53))
- 🆕 使用 pdfjs 渲染 pdf ([da3ceab](https://github.com/liunnn1994/sd-design/commit/da3ceabe84c10c928a817fb619a4c1e0ec97abd1))
- 🆕 新增 mcp ([c931d96](https://github.com/liunnn1994/sd-design/commit/c931d96442429a423213f78e55a6cbe4f889d971))

# [3.9.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.8.0...web-vue-v3.9.0) (2026-07-13)

### Features

- 🆕 sd-design 添加前缀后缀功能 ([03001b5](https://github.com/liunnn1994/sd-design/commit/03001b53f2db9764413d7899eea0b3455faf53fb))

# [3.8.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.7.1...web-vue-v3.8.0) (2026-07-10)

### Bug Fixes

- 🐛 修复文件预览里嵌套图片时的错误 ([4783782](https://github.com/liunnn1994/sd-design/commit/4783782ed1191ec1eddb0d06c08a0ed536f05322))

### Features

- 🆕 测试用例全部从单元测试转换为真实的e2e测试 ([49821ea](https://github.com/liunnn1994/sd-design/commit/49821ea1ec3a2af6c6774f8b6f90d56fbe44c576))

## [3.7.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.7.0...web-vue-v3.7.1) (2026-07-09)

### Bug Fixes

- 🐛 修复错误的 responsive 计算 ([7a020b4](https://github.com/liunnn1994/sd-design/commit/7a020b4bbaee73451ede2c7d623dd1ca4d8eefcd))

# [3.7.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.6.0...web-vue-v3.7.0) (2026-07-09)

### Features

- 🆕 移除历史兼容层，统一使用 v-model ([7bf0921](https://github.com/liunnn1994/sd-design/commit/7bf09218f7b68dacfeeabb3a0e7ce6fe38c40fb8))

# [3.6.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.5.0...web-vue-v3.6.0) (2026-07-08)

### Bug Fixes

- 🐛 修复 trigger 嵌套的时候无法关闭的问题 ([dffee59](https://github.com/liunnn1994/sd-design/commit/dffee5943a76b609cba8e82a02dbbe8d08447e1f))
- 🐛 修复错误的 Vue runtime 引用，会导致在线编辑中的 vue 实例引用不是一个，触发意外错误 ([41bf83a](https://github.com/liunnn1994/sd-design/commit/41bf83ae61cdb452853f32f8cf95fc0afc2cf7c0))

### Features

- 🆕 使用Image组件预览图片，videojs预览音视频 ([14735ee](https://github.com/liunnn1994/sd-design/commit/14735ee3a881bbd7be71890d1b8ea01a31817712))

# [3.5.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.4.0...web-vue-v3.5.0) (2026-07-08)

### Features

- 🆕 移除 toolbar 的背景色 ([7074fdc](https://github.com/liunnn1994/sd-design/commit/7074fdcbb6ad75ce8f4a02767dfd840418c5cebc))

# [3.4.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.3.1...web-vue-v3.4.0) (2026-07-08)

### Bug Fixes

- 🐛 tag 最小有一个字符的宽度 ([84b7c8c](https://github.com/liunnn1994/sd-design/commit/84b7c8cebd31199df84e06ccfb35667ec7ce323d))
- 🐛 修复 table 错误的高度处理 ([70d068f](https://github.com/liunnn1994/sd-design/commit/70d068fdc4d9f83a0b6be839c70c927014841110))

### Features

- 🆕 table 使用全新的虚拟滚动，现已支持树形等复杂结构 ([76e43a4](https://github.com/liunnn1994/sd-design/commit/76e43a47f68449ff1e271dea632dbf5566d652ea))
- 🆕 重构虚拟列表，使用 virtua 替换 vue-virtual-scroller ([816cc59](https://github.com/liunnn1994/sd-design/commit/816cc59662d6ea9aa57034cf5496771ee98222b8))

## [3.3.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.3.0...web-vue-v3.3.1) (2026-07-07)

### Bug Fixes

- 🐛 修复错误的文字颜色 ([b5b3234](https://github.com/liunnn1994/sd-design/commit/b5b32348c981610fbb61efce3c037fe453b56a1e))

# [3.3.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.2.1...web-vue-v3.3.0) (2026-07-07)

### Bug Fixes

- 🐛 修复 color-picker 颜色切换无效的问题 ([23926ad](https://github.com/liunnn1994/sd-design/commit/23926ad0cadb702eeafb1e469d0f0fe1415aeab8))
- 🐛 修复tagProps没有后正确使用的问题 ([659c91d](https://github.com/liunnn1994/sd-design/commit/659c91d347ac0728e9727feb386ab9536d7a7e22))

### Features

- 🆕 message的resetOnHover默认是true ([f2dcdbc](https://github.com/liunnn1994/sd-design/commit/f2dcdbc006dff7422728e4db84b0e1c6256c4514))
- 🆕 tag 支持从 color 中自动提取透明度 ([7f3edca](https://github.com/liunnn1994/sd-design/commit/7f3edcaecce38083d53f97f0e159257bf541ec44))
- 🆕 优化 color-picker 性能，并避免快速拖拽时浏览器触发页面文字选中 ([38760c7](https://github.com/liunnn1994/sd-design/commit/38760c77057b0f14b1c84f44ac5445cb2785a134))
- 🆕 把文档从 netlify 迁移到 gh page ([a7143a4](https://github.com/liunnn1994/sd-design/commit/a7143a49eba3faba99d8664a7a4f887d67b2af62))
- 🆕 新 table 组件，对齐arcodesign ([fca78cb](https://github.com/liunnn1994/sd-design/commit/fca78cb5817b9a8f48a687a6736cb8ee4e6dfbc5))
- 🆕 新增 toolbar 组件 ([59d3485](https://github.com/liunnn1994/sd-design/commit/59d348578ac131b43ddb6da80f20a23918408da4))
- 🆕 新增全局配置 pagination ([43da319](https://github.com/liunnn1994/sd-design/commit/43da319027e87668d3e051d501c9fdc867e6b863))
- 🆕 新增全局配置 pagination ([aedf056](https://github.com/liunnn1994/sd-design/commit/aedf0563874b6fc9480932a808264120604e9ac4))

# [3.1.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.0.2...web-vue-v3.1.0) (2026-07-03)

### Bug Fixes

- 🐛 修复未导出的类型 ([5ef7e6d](https://github.com/liunnn1994/sd-design/commit/5ef7e6df7664d3a84b0669de6dcf61d1ce69d3cb))
- 🐛 修复测试用例报错 ([3c10669](https://github.com/liunnn1994/sd-design/commit/3c106699c2ca49abd7fa472e24dd2fd4f56d8f49))
- 🐛 修复滚动滚动条的问题 ([367c3f6](https://github.com/liunnn1994/sd-design/commit/367c3f6ebde8638eabe41d123c1e2ab4e06f40f4))

### Features

- 🆕 tree node 在block模式下是100% ([83912ea](https://github.com/liunnn1994/sd-design/commit/83912ea27ffdb1752238961d12b14e8d321e9c00))
- 🆕 透传 node 事件 ([a2bdf88](https://github.com/liunnn1994/sd-design/commit/a2bdf8834dfd07bf720ccce1e2f56ecb6d477eac))

## [3.0.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.0.1...web-vue-v3.0.2) (2026-07-03)

### Bug Fixes

- 🐛 修复 trigger 层级的问题 ([c703be3](https://github.com/liunnn1994/sd-design/commit/c703be3d4fc97be334b1144714043e973f13ddf9))

## [3.0.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.0.0...web-vue-v3.0.1) (2026-07-02)

### Bug Fixes

- 🐛 修复 json form 错误的 margin ([f3ba0d1](https://github.com/liunnn1994/sd-design/commit/f3ba0d1b6a714191b70cfa79930df5830682633b))

# [3.0.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.11.3...web-vue-v3.0.0) (2026-06-30)

### Features

- 🆕 修改 spin 的样式 ([44f0b53](https://github.com/liunnn1994/sd-design/commit/44f0b538f2ca79cae64bf73dbe4236caf66a6839))

### BREAKING CHANGES

- 🧨 spin 由 inline-block 改为 block

## [2.11.3](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.11.2...web-vue-v2.11.3) (2026-06-29)

### Bug Fixes

- 🐛 修复在线编辑器的自动导入无法识别部分组件的问题 ([2807ecb](https://github.com/liunnn1994/sd-design/commit/2807ecbcbab6a42e434cdb18a75bc85ccb4e6693))

## [2.11.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.11.1...web-vue-v2.11.2) (2026-06-29)

### Bug Fixes

- 🐛 修复错误的样式处理 ([3423331](https://github.com/liunnn1994/sd-design/commit/3423331861c6d846d5b639828a5489dad08c1d89))

## [2.11.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.11.0...web-vue-v2.11.1) (2026-06-25)

### Bug Fixes

- 🐛 修复错误的竟态 ([5d3efcb](https://github.com/liunnn1994/sd-design/commit/5d3efcbf1c7882954903cab6c2a3acb73af7354c))

# [2.11.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.10.2...web-vue-v2.11.0) (2026-06-25)

### Bug Fixes

- 🐛 修复错误的大小写 ([fed991f](https://github.com/liunnn1994/sd-design/commit/fed991f7bcc1b66fc377dec8d738484c01e5ce04))
- 🐛 修复首次启动文件缺失的问题 ([81dc32e](https://github.com/liunnn1994/sd-design/commit/81dc32e42744732645da59aa0996190f63c22df8))

### Features

- 🆕 优化 layout header 的默认按钮颜色 ([6ff7edc](https://github.com/liunnn1994/sd-design/commit/6ff7edc8eac3268f0d54611711266762d3d86f17))

## [2.10.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.10.1...web-vue-v2.10.2) (2026-06-25)

### Bug Fixes

- 🐛 修复header错误的颜色 ([cac77ae](https://github.com/liunnn1994/sd-design/commit/cac77ae162ce0fe0ed428f22050bc65d39487ac5))

## [2.10.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.10.0...web-vue-v2.10.1) (2026-06-25)

### Bug Fixes

- 🐛 CI 发布时跳过本地 pre-push 钩子 ([37a6e99](https://github.com/liunnn1994/sd-design/commit/37a6e9920300b791b2ade7b19052eb48e5ca0ddd))

# [2.10.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.9.0...web-vue-v2.10.0) (2026-06-25)

### Features

- 🆕 layout 添加 rail 模式 ([43ae0db](https://github.com/liunnn1994/sd-design/commit/43ae0dbdf0e1e17c434a60d0bf73e34cd47e4f3a))
- 🆕 文档站更新到 astro 7 ([606a140](https://github.com/liunnn1994/sd-design/commit/606a140300af766f8b26d3caab1f290f53853005))
- 🆕 隔离 web-vue 与 auto-import-resolver 的发布 tag 命名空间 ([95ad739](https://github.com/liunnn1994/sd-design/commit/95ad7393ae2dfc9ea4fcdf040a38b43b2016e906))

# [2.9.0](https://github.com/liunnn1994/sd-design/compare/v2.8.0...v2.9.0) (2026-06-23)

### Features

- 🆕 统一 layout 的 header 背景颜色 ([76796f3](https://github.com/liunnn1994/sd-design/commit/76796f3358e174d55ea15dd0bf8559cfe9ebc41e))

# [2.8.0](https://github.com/liunnn1994/sd-design/compare/v2.7.0...v2.8.0) (2026-06-23)

### Features

- 🆕 更新依赖 ([a014966](https://github.com/liunnn1994/sd-design/commit/a014966faf938539e5bff78b334af2d40efc135f))

# [2.6.0](https://github.com/liunnn1994/sd-design/compare/v2.5.0...v2.6.0) (2026-06-22)

### Bug Fixes

- 🐛 修复 lint 警告 ([5842e17](https://github.com/liunnn1994/sd-design/commit/5842e17389e110aa78d522f6b552cd54553672a7))

### Features

- 🆕 全新的 layout，对齐 antd ([85a8cb8](https://github.com/liunnn1994/sd-design/commit/85a8cb84bf7601527262f7fd2a1aaeab35d570c9))
- 🆕 统一主题获取，消除重复性 ([d2c0d47](https://github.com/liunnn1994/sd-design/commit/d2c0d47d4f09a96c5b5cdff97bd5eda730b9654f))

## [2.3.1](https://github.com/liunnn1994/sd-design/compare/v2.3.0...v2.3.1) (2026-06-15)

### Bug Fixes

- 🐛 修复自动导入工具无效的问题 ([45eaaf7](https://github.com/liunnn1994/sd-design/commit/45eaaf721699c8027edf0ec1541c404efb0a0be2))

## [2.2.1](https://github.com/liunnn1994/sd-design/compare/v2.2.0...v2.2.1) (2026-06-11)

### Bug Fixes

- 🐛 修复打包失败的问题 ([590a3cd](https://github.com/liunnn1994/sd-design/commit/590a3cd0715fa49cd2ed2e4ff55cd108a129ea3b))

## [2.1.1](https://github.com/liunnn1994/sd-design/compare/v2.1.0...v2.1.1) (2026-06-09)

### Bug Fixes

- 🐛 修复 ts 报错 ([cf2f1ac](https://github.com/liunnn1994/sd-design/commit/cf2f1ac4a9b9166e927255fc547a054c40930348))
- 🐛 修复 ts 的类型 ([e76e685](https://github.com/liunnn1994/sd-design/commit/e76e68536c4a97181f3b4549c4a98a24751bb68d))

# [2.1.0](https://github.com/liunnn1994/sd-design/compare/v2.0.0...v2.1.0) (2026-06-09)

### Features

- 🆕 去掉option组件 ([74283d9](https://github.com/liunnn1994/sd-design/commit/74283d9adfb312c241509a035dd85511e04f716c))

# [1.19.0](https://github.com/liunnn1994/sd-design/compare/v1.18.0...v1.19.0) (2026-05-21)

### Features

- 🆕 去掉首页的侧边栏 ([c0ee6c3](https://github.com/liunnn1994/sd-design/commit/c0ee6c3f9c9a7d3e2001e3ce262b42ae09da1f46))

# [1.18.0](https://github.com/liunnn1994/sd-design/compare/v1.17.0...v1.18.0) (2026-05-21)

### Features

- 🆕 添加了 ai 工具说明 ([19b9ada](https://github.com/liunnn1994/sd-design/commit/19b9ada07f5125e4ef79bff25ec00871d2c877a4))

# [1.14.0](https://github.com/liunnn1994/sd-design/compare/v1.13.0...v1.14.0) (2026-05-19)

### Bug Fixes

- 🐛 修复 ts 报错 ([ce5b3c2](https://github.com/liunnn1994/sd-design/commit/ce5b3c2a1319bbf573968c132d20985b40d9bd0b))
- 🐛 修复 ts 报错 ([5156619](https://github.com/liunnn1994/sd-design/commit/5156619f189b6628cb9132ec5604509987f46277))

### Features

- 🆕 DatePicker 默认配置 ([a71ba18](https://github.com/liunnn1994/sd-design/commit/a71ba18bb4bd2913048f9ad683661316fabe9042))
- 🆕 新增自动导入插件 ([cc6fb54](https://github.com/liunnn1994/sd-design/commit/cc6fb54744d015c535d98636e02581cb6b3f7e42))
- 🆕 给 modal/drawer 添加全局配置 ([a81fff9](https://github.com/liunnn1994/sd-design/commit/a81fff99e566aa0d4a3808ab7c3434cb5ee155ff))

# [1.13.0](https://github.com/liunnn1994/sd-design/compare/v1.12.0...v1.13.0) (2026-05-19)

### Features

- 🆕 新增默认下拉虚拟滚动参数 ([5fabe49](https://github.com/liunnn1994/sd-design/commit/5fabe499adb899069b1213807de91e7f19582639))

# [1.12.0](https://github.com/liunnn1994/sd-design/compare/v1.11.1...v1.12.0) (2026-05-19)

### Bug Fixes

- 🐛 修复 css 不存在的问题 ([b13f58f](https://github.com/liunnn1994/sd-design/commit/b13f58fb52ff73a55292cbbae49bee5a2f5b1653))
- 🐛 修复 ts 报错 ([b0e43e4](https://github.com/liunnn1994/sd-design/commit/b0e43e409d2afbbb0597902fd553027fb1814379))
- 🐛 修复打包错误 ([d484da2](https://github.com/liunnn1994/sd-design/commit/d484da2b6c15b4188ac896173dddf92bd23ebdaa))

### Features

- 🆕 input number 新增字符串格式的支持 ([a0781f4](https://github.com/liunnn1994/sd-design/commit/a0781f4af9b23d3e1e0cbf9a1826b8f2f366a025))
- 🆕 link 支持 ellipsis 功能 ([b4a3faa](https://github.com/liunnn1994/sd-design/commit/b4a3faad4699443633d1280c12c368f5bbc2f32e))
- 🆕 tag 新增 ellipsis 支持，新增 tagGroup ([4f3eec1](https://github.com/liunnn1994/sd-design/commit/4f3eec192392fda1eff7d543839189c83629f783))
- 🆕 为 copy 添加参数透传 ([eac34d2](https://github.com/liunnn1994/sd-design/commit/eac34d28950bbebf5751807675ef672930b988cb))
- 🆕 新增 copy 组件 ([abc7f71](https://github.com/liunnn1994/sd-design/commit/abc7f716c087378d12ad8174a6681f32a01f22e1))
- 🆕 新增 cropper 组件 ([5836775](https://github.com/liunnn1994/sd-design/commit/5836775e97006df825ceb87191c71ef80a4aa0e1))
- 🆕 添加 llms.txt ([f7728d0](https://github.com/liunnn1994/sd-design/commit/f7728d060de8f9b257fba80dd5bad8cb826b7ea6))
- 🆕 添加 secret 组件 ([8baa016](https://github.com/liunnn1994/sd-design/commit/8baa016b3da76ac907d46ef469573d4b14bfab93))
- 🆕 添加全局 allow-search ([2816edd](https://github.com/liunnn1994/sd-design/commit/2816edd6368c12b4cffb2958b11fbdc6c35d935a))
- 🆕 组件改为 setup 写法 ([282678b](https://github.com/liunnn1994/sd-design/commit/282678bce6a34512d3656bf215d7cfd0c13bdf2c))

## [1.11.1](https://github.com/liunnn1994/sd-design/compare/v1.11.0...v1.11.1) (2026-05-16)

### Bug Fixes

- 🐛 修复 ts 和错误导入 react 的问题 ([3518677](https://github.com/liunnn1994/sd-design/commit/3518677a09d1a96f1198c462a345a9caca2761f0))
- 🐛 修复错误的引入 react 的问题 ([5b790a0](https://github.com/liunnn1994/sd-design/commit/5b790a01c3fe1054c618645f763e038d80eddad3))

# [1.11.0](https://github.com/liunnn1994/sd-design/compare/v1.10.0...v1.11.0) (2026-05-16)

### Bug Fixes

- 🐛 修复 table 固定列的问题 ([26d4dcd](https://github.com/liunnn1994/sd-design/commit/26d4dcd5eae33a01f4718b813494a454c36cecef))
- 🐛 修复 ts 报错 ([31880dc](https://github.com/liunnn1994/sd-design/commit/31880dc15596465cd4272039a84dae5ce31d58c3))
- 🐛 修复 ts 报错 ([ea5166e](https://github.com/liunnn1994/sd-design/commit/ea5166ea6b68cd079009d0fffccdaf1c8c2d461a))

### Features

- 🆕 优化所有 less 遗留 ([8513187](https://github.com/liunnn1994/sd-design/commit/8513187d734703cdbb8345750438c335a7f2daf9))

# [1.10.0](https://github.com/liunnn1994/sd-design/compare/v1.9.0...v1.10.0) (2026-05-12)

### Bug Fixes

- 🐛 修复打包报错 ([d16773c](https://github.com/liunnn1994/sd-design/commit/d16773cf404004aba1030822fa74bbed74bde69f))

### Features

- 🆕 使用 ts7 并修复 ts 报错 ([667fb96](https://github.com/liunnn1994/sd-design/commit/667fb96b73d17cc2e098bf960cf826db06a8ad67))
- 🆕 迁移 cascader ([3242fdb](https://github.com/liunnn1994/sd-design/commit/3242fdbe3ca558d7b6e5392bf5c5df2c9c92a73b))
- 🆕 迁移 scrollbar ([563830b](https://github.com/liunnn1994/sd-design/commit/563830bf9d49228c85d4f0f042e87dff99b349c0))
- 🆕 迁移虚拟列表 ([098b1c9](https://github.com/liunnn1994/sd-design/commit/098b1c9e8cefe2f7dd3d18d339e712d259652224))

# [1.9.0](https://github.com/liunnn1994/sd-design/compare/v1.8.0...v1.9.0) (2026-05-08)

### Features

- 🆕 迁移 select ([b0102fa](https://github.com/liunnn1994/sd-design/commit/b0102faad9f0d4ad580b193e51d45f3f6baf72d4))
- 🆕 迁移 select 和 tree-select ([9997da2](https://github.com/liunnn1994/sd-design/commit/9997da2175b5d93bc8f11d9b9b5678ca5730cff9))

# [1.8.0](https://github.com/liunnn1994/sd-design/compare/v1.7.1...v1.8.0) (2026-05-07)

### Features

- 🆕 新增 allowClear 全局配置 ([368f106](https://github.com/liunnn1994/sd-design/commit/368f1064b3a47ea97a1bfc6a3098d2ba259be7e2))
- 🆕 新增 color-picker ([54e12e9](https://github.com/liunnn1994/sd-design/commit/54e12e9bd77d6aafa70c9ab60d7ff3029e920139))

## [1.7.1](https://github.com/liunnn1994/sd-design/compare/v1.7.0...v1.7.1) (2026-04-30)

### Bug Fixes

- 🐛 修复局部主题会影响到全局的问题 ([10a8f46](https://github.com/liunnn1994/sd-design/commit/10a8f4697a7e30d7121d0105920630c675b637f8))

# [1.7.0](https://github.com/liunnn1994/sd-design/compare/v1.6.0...v1.7.0) (2026-04-30)

### Features

- 🆕 使用 scss 替换 less ([552728f](https://github.com/liunnn1994/sd-design/commit/552728fcb033d26a68eaa45bab94fe4e6050341c))
- 🆕 添加主题的切换以及演示 ([c467c13](https://github.com/liunnn1994/sd-design/commit/c467c1395f8610439c305141578ee544cd147142))

# [1.6.0](https://github.com/liunnn1994/sd-design/compare/v1.5.0...v1.6.0) (2026-04-21)

### Features

- 🆕 改用 Trusted publishing ([394a570](https://github.com/liunnn1994/sd-design/commit/394a570da537caee6bc53b911f9fa70b844fed7c))

# [1.5.0](https://github.com/liunnn1994/sd-design/compare/v1.4.1...v1.5.0) (2026-04-16)

### Features

- 🆕 新增 ellipsis 组件 ([4b7d562](https://github.com/liunnn1994/sd-design/commit/4b7d56275ba948befd92a7bfc5e55c1a39eec085))

## [1.4.1](https://github.com/liunnn1994/sd-design/compare/v1.4.0...v1.4.1) (2026-04-16)

### Bug Fixes

- 🐛 修复在线编辑器 ([804d0d3](https://github.com/liunnn1994/sd-design/commit/804d0d30a4a3a5e3a8bf9ef0391297d41d137830))

# [1.4.0](https://github.com/liunnn1994/sd-design/compare/v1.3.0...v1.4.0) (2026-04-16)

### Bug Fixes

- 🐛 修复 lint 问题 ([7f81320](https://github.com/liunnn1994/sd-design/commit/7f8132010628e0d976aec97448329a96e1d52b74))
- 🐛 修复在线编辑功能报错的问题 ([1bf5879](https://github.com/liunnn1994/sd-design/commit/1bf5879a52e22bb1fe6c64a14772c3e845a009d9))

### Features

- 更新架构，使用 vite+，同时把 jest 的测试用例迁移到 vitest 上 ([990b5e4](https://github.com/liunnn1994/sd-design/commit/990b5e48602b8dca3b6cb95982ffb7287173bd97))

# [1.3.0](https://github.com/liunnn1994/sd-design/compare/v1.2.0...v1.3.0) (2026-04-14)

### Features

- 移除 scripts 减少复杂度 ([655ee6c](https://github.com/liunnn1994/sd-design/commit/655ee6cdf622325ea738a6b233a7a7104d569092))

# [1.2.0](https://github.com/liunnn1994/sd-design/compare/v1.1.0...v1.2.0) (2026-04-14)

### Features

- 使用新文档 ([3619a7b](https://github.com/liunnn1994/sd-design/commit/3619a7b6ad453cfa645a6923e63f1f7d79cb55e1))

# [1.1.0](https://github.com/liunnn1994/sd-design/compare/v1.0.0...v1.1.0) (2026-04-14)

### Features

- 🆕 文档部署使用 netlify.toml 流水线 ([5663b1e](https://github.com/liunnn1994/sd-design/commit/5663b1ebaf9df7886c147148fc4fb06dde1573c3))
