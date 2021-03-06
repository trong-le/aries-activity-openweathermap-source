import { Activity, singleS3StreamOutput } from 'aries-data';
import request from 'request-promise';

/**
 * Activity to run a query on Open Weather Map.
 */
export default class OpenWeatherMapSource extends Activity {
    static props = {
        name: require('../package.json').name,
        version: require('../package.json').version,
    };

    static uri = 'http://api.openweathermap.org';
    static path = '/data/2.5';

    @singleS3StreamOutput('json')
    async onTask(activityTask, config) {
        let data = null, dataArray = [];
        // Run query.
        switch (config.method) {
            case 'forecast':
            data = await this.requestForecast(config);
            break;
            case 'current':
            const queryResponse = await this.requestCurrentWeather(config);
            const document = await this.transform(queryResponse)
            dataArray.push(document);
            data = dataArray;
            break;
            default:
            break;
        }

        // Return the stringified document.
        return data;
    }

    async requestForecast(config) {
        // Create params.
        const params = {
            uri: OpenWeatherMapSource.uri + OpenWeatherMapSource.path + config.dataPath,
            qs: config,
            json: true,
        };

        // Run our query.
        const data = await request(params);
        return data.list;
    }

    async requestCurrentWeather(config) {
        // Create params.
        const params = {
            uri: OpenWeatherMapSource.uri + OpenWeatherMapSource.path + config.dataPath,
            qs: config,
            json: true,
        };

        // Run our query.
        return await request(params);
    }

    transform(doc) {
        return Object.assign(doc, { timestamp: new Date() });
    }
};
