const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const sinon = require('sinon');
const utils = require('../generators/utils');

describe('JHipster Utils', () => {
    describe('::getJavadoc', () => {
        describe('when passing a negative or nil increment', () => {
            it('returns the comment with no increment', () => {
                assert.textEqual(utils.getJavadoc('whatever', -42), '/**\n * whatever\n */');
                assert.textEqual(utils.getJavadoc('whatever', 0), '/**\n * whatever\n */');
            });
        });
        describe('when passing a positive increment', () => {
            it('returns the comment with the increment', () => {
                assert.textEqual(utils.getJavadoc('whatever', 1), ' /**\n  * whatever\n  */');
            });
        });
        describe('when passing a nil comment', () => {
            it('inserts an empty comment instead of failing', () => {
                assert.textEqual(utils.getJavadoc(null, 1), ' /**\n  * \n  */');
            });
        });
        describe('when passing a comment containing double quotes', () => {
            it('escapes the quotes', () => {
                assert.textEqual(utils.getJavadoc('Comment="KO"', 1), ' /**\n  * Comment=\\"KO\\"\n  */');
            });
        });
    });
    describe('::escapeRegExp', () => {
        describe('when the string is not a java class name', () => {
            it('converts string into proper java class name', () => {
                assert.textEqual(utils.classify('class name'), 'ClassName');
            });
        });
        describe('when the string is already a java class name', () => {
            it('will not convert the string', () => {
                assert.textEqual(utils.classify('ClassName'), 'ClassName');
            });
        });
    });
    describe('::copyObjectProps', () => {
        it('expects all the pairs (key, value) of the source to be in destination', () => {
            const src = { foo: 'foo', foo2: 'foo2' };
            const dst = { foo3: 'foo3' };
            utils.copyObjectProps(dst, src);
            assert.objectContent(dst, src);
        });
    });
    describe('::buildEnumFunction', () => {
        it('describes all the properties of the entity', () => {
            const packageName = 'com.package';
            const angularAppName = 'myApp';
            const clientRootFolder = 'root';
            const entity = { enumName: 'entityName', fieldValues: 'field1, field2' };
            const infos = utils.buildEnumInfo(entity, angularAppName, packageName, clientRootFolder);
            assert.objectContent(infos, { packageName, angularAppName, clientRootFolder: `${clientRootFolder}-` });
        });
    });
    describe('::deepFind function', () => {
        const jsonData = {
            foo11: 'foo11value',
            fooNested: { foo21: 'foo21value' },
            foo21: 'foo21value'
        };
        describe('the key is found in the object that is searched', () => {
            it('returns the value associated to the key', () => {
                const value = utils.deepFind(jsonData, 'foo21');
                assert.textEqual(value, 'foo21value');
            });
        });
        describe('the key is not found in the object that is searched', () => {
            it('returns undefined', () => {
                const value = utils.deepFind(jsonData, 'foo123');
                assert.textEqual(`${value}`, 'undefined');
            });
        });
    });
    describe('::parseBluePrints', () => {
        it('does nothing if an array', () => {
            const expected = [{ name: 'generator-finscale-hipsters-foo', version: 'latest' }];
            const actual = utils.parseBluePrints(expected);
            assert.deepStrictEqual(actual, expected);
        });
        it('adds generator-finscale-hipsters prefix if it is absent', () => {
            const expected = [{ name: 'generator-finscale-hipsters-foo', version: 'latest' }];
            const actual = utils.parseBluePrints('foo');
            assert.deepStrictEqual(actual, expected);
        });
        it('keeps generator-finscale-hipsters prefix if it is present', () => {
            const expected = [{ name: 'generator-finscale-hipsters-foo', version: '1.0.1' }];
            const actual = utils.parseBluePrints('generator-finscale-hipsters-foo@1.0.1');
            assert.deepStrictEqual(actual, expected);
        });
        it("doesn't modify scoped package and extracts version", () => {
            const expected = [{ name: '@corp/foo', version: '1.0.1' }];
            const actual = utils.parseBluePrints('@corp/foo@1.0.1');
            assert.deepStrictEqual(actual, expected);
        });
        it('parses comma separated list', () => {
            const expected = [
                { name: 'generator-finscale-hipsters-foo', version: 'latest' },
                { name: 'generator-finscale-hipsters-bar', version: '1.0.1' },
                { name: '@corp/foo', version: 'latest' }
            ];
            const actual = utils.parseBluePrints('foo,bar@1.0.1,@corp/foo');
            assert.deepStrictEqual(actual, expected);
        });
    });
    describe('::normalizeBlueprintName', () => {
        it('adds generator-finscale-hipsters prefix if it is absent', () => {
            const generatorName = utils.normalizeBlueprintName('foo');
            assert.textEqual(generatorName, 'generator-finscale-hipsters-foo');
        });
        it('keeps generator-finscale-hipsters prefix if it is present', () => {
            const generatorName = utils.normalizeBlueprintName('generator-finscale-hipsters-foo');
            assert.textEqual(generatorName, 'generator-finscale-hipsters-foo');
        });
        it("doesn't  do anything for scoped package", () => {
            const generatorName = utils.normalizeBlueprintName('@corp/foo');
            assert.textEqual(generatorName, '@corp/foo');
        });
    });
    describe('::getAllJhipsterConfig', () => {
        describe('without blueprint', () => {
            const cwd = process.cwd();
            const configRootDir = './test/templates/default';
            const expectedConfig = {
                applicationType: 'monolith',
                baseName: 'sampleMysql',
                packageName: 'com.mycompany.myapp',
                packageFolder: 'com/mycompany/myapp',
                authenticationType: 'session',
                cacheProvider: 'ehcache',
                websocket: 'no',
                databaseType: 'sql',
                devDatabaseType: 'h2Disk',
                prodDatabaseType: 'mysql',
                searchEngine: 'no',
                buildTool: 'maven',
                enableTranslation: true,
                nativeLanguage: 'en',
                languages: ['en', 'fr'],
                rememberMeKey: '2bb60a80889aa6e6767e9ccd8714982681152aa5',
                testFrameworks: ['gatling']
            };

            it('load config from alternate directory', () => {
                const loadedConfig = utils.getAllJhipsterConfig(helpers.createDummyGenerator(), true, configRootDir);
                assert.objectContent(loadedConfig, expectedConfig);
            });
            it('load config from current working directory', () => {
                process.chdir(configRootDir);
                const loadedConfig = utils.getAllJhipsterConfig(helpers.createDummyGenerator(), true);
                assert.objectContent(loadedConfig, expectedConfig);
            });
            after(() => {
                process.chdir(cwd);
            });
        });
        describe('with blueprint', () => {
            const configRootDir = './test/templates/ngx-blueprint';

            it('merges config from main generator and blueprint', () => {
                const expectedConfig = {
                    applicationType: 'monolith',
                    baseName: 'myblueprint',
                    packageName: 'com.mycompany.myapp',
                    packageFolder: 'com/mycompany/myapp',
                    authenticationType: 'jwt',
                    cacheProvider: 'ehcache',
                    websocket: false,
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    searchEngine: false,
                    buildTool: 'maven',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    testFrameworks: ['gatling', 'protractor'],
                    jhiPrefix: 'jhi'
                };
                const loadedConfig = utils.getAllJhipsterConfig(helpers.createDummyGenerator(), true, configRootDir);
                assert.objectContent(loadedConfig, expectedConfig);
            });
            it('correctly handles deprecated blueprint information', () => {
                const expectedBlueprints = [{ name: 'generator-jhipster-myblueprint', version: '0.2' }];
                const loadedConfig = utils.getAllJhipsterConfig(helpers.createDummyGenerator(), true, configRootDir);
                assert.deepStrictEqual(loadedConfig.get('blueprints'), expectedBlueprints);
            });
        });
    });
    describe('::stringHashCode', () => {
        it('calculates hash', () => {
            assert.equal(utils.stringHashCode('some text'), 642107175);
        });
    });
    describe('::gitExec', () => {
        it('Executes command synchronously without options', () => {
            const result = utils.gitExec('--version');
            assert.strictEqual(result.code, 0);
            assert.strictEqual(result.stdout.length > 0, true);
            assert.strictEqual(result.stdout.startsWith('git version '), true);
            assert.strictEqual(result.stderr.length, 0);
        });

        it('Executes command synchronously with options', () => {
            const result = utils.gitExec('--version', { trace: true });
            assert.strictEqual(result.code, 0);
            assert.strictEqual(result.stdout.length > 0, true);
            assert.strictEqual(result.stdout.startsWith('git version '), true);
            assert.strictEqual(result.stderr.length, 0);
        });

        before(done => {
            this.callback = sinon.spy();
            this.result = utils.gitExec('rev-parse --is-inside-work-tree', this.callback);
            done();
        });
        it('Executes command asynchronously without options', () => {
            sinon.assert.calledOnce(this.callback);
            assert.strictEqual(this.callback.getCall(0).args[0], 0);
            assert.strictEqual(this.callback.getCall(0).args[1].trim(), 'true');
            assert.strictEqual(this.callback.getCall(0).args[2], '');
        });

        before(done => {
            this.callback = sinon.spy();
            this.result = utils.gitExec('rev-parse --is-inside-work-tree', { trace: true }, this.callback);
            done();
        });
        it('Executes command asynchronously with options', () => {
            sinon.assert.calledOnce(this.callback);
            assert.strictEqual(this.callback.getCall(0).args[0], 0);
            assert.strictEqual(this.callback.getCall(0).args[1].trim(), 'true');
            assert.strictEqual(this.callback.getCall(0).args[2], '');
        });
    });
    describe('::isGitInstalled', () => {
        it('Check installed without callback', () => {
            const isGitInstalled = utils.isGitInstalled();
            assert.strictEqual(isGitInstalled, true);
        });
        it('Check installed and execute callback', () => {
            const callback = sinon.spy();
            const isGitInstalled = utils.isGitInstalled(callback);
            assert.strictEqual(isGitInstalled, true);
            sinon.assert.calledOnce(callback);
        });
    });
});
