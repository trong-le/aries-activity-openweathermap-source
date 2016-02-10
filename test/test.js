import test from 'blue-tape';
import nock from 'nock';
import openWeatherMap from '..';

function getTestConfig() {
    return { appId: 'efa17477a7e8b2723afdbee014ae0fba', q: 'Lexington, KY' };
}

// Test we have proper configuration.
test('proper configuration', t => {
    const activity = openWeatherMap();
    t.equal(activity.config.name, require('../package.json').name);
    t.equal(activity.config.version, require('../package.json').version);
    t.end();
});

// Test api request.
test('api request', t => async function() {
    const activity = openWeatherMap();
    const config = getTestConfig();

    // Intercept request.
    const scope = nock(activity.config.uri)
        .get(activity.config.path)
        .query(config)
        .reply(200, { 'weather': 'data' });

    const result = await activity.request(config);
    t.deepEqual(result, { 'weather': 'data' });
}());

// Test s3 upload.
test('s3 upload', t => async function() {
    const activity = openWeatherMap();

    const key = '12345';
    const body = { 'weather': 'data' };

    // Intercept request.
    const scope = nock('https://astronomer-workflows.s3.amazonaws.com')
        .put(`/${key}`)
        .reply(200);

    const response = await activity.upload(key, body);
    t.equal(response.key, key);
}());

// Non-mocked, full-blown test.
// Typically skipped unless directly testing.
test.skip('onTask', t => async function() {
    const activity = openWeatherMap();
    const config = getTestConfig();
    const key = await activity.onTask({}, config);
    t.comment(key);
    t.ok(key);
}());
