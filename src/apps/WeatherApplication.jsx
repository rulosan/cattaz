import React from 'react';
import PropTypes from 'prop-types';

// OpenWeatherMap [https://openweathermap.org/]
const apiKey = 'Your API Key';
const baseURL = 'http://api.openweathermap.org/data/2.5/weather';
const units = 'metric';
const iconURL = 'http://openweathermap.org/img/w/';

class WeatherModel {
  constructor() {
    this.country = '';
    this.city = '';
    this.weather = '';
    this.icon = '';
    this.temp = 0;
  }
  getWeather(data) {
    this.country = data.sys.country;
    this.city = data.name;
    this.weather = data.weather[0].main;
    this.icon = data.weather[0].icon;
    this.temp = data.main.temp;
  }
  serialize() {
    return JSON.stringify(this, null, 2);
  }
  static deserialize(str) {
    try {
      const obj = JSON.parse(str);
      const model = new WeatherModel();
      model.country = obj.country;
      model.city = obj.city;
      model.weather = obj.weather;
      model.icon = obj.icon;
      model.temp = obj.temp;
      return model;
    } catch (ex) {
      return new WeatherModel();
    }
  }
}

export default class WeatherApplication extends React.Component {
  constructor(props) {
    super();
    this.handleGetWeather = this.handleGetWeather.bind(this);
    this.state = { weather: WeatherModel.deserialize(props.data), errorMessage: '' };
  }
  componentWillReceiveProps(newProps) {
    const weather = WeatherModel.deserialize(newProps.data);
    this.setState({ weather });
  }
  shouldComponentUpdate(/* newProps, nextState */) {
    // TODO
    return true;
  }
  handleGetWeather() {
    const city = this.inputCity.value;
    if (!city) return;
    window.fetch(`${baseURL}?q=${city}&units=${units}&appid=${apiKey}`)
    .then(response => response.json())
    .then((data) => {
      if (data.cod === 200) {
        this.state.weather.getWeather(data);
        this.setState({ errorMessage: '' });
        this.props.onEdit(this.state.weather.serialize(), this.props.appContext);
      } else if (data.cod === 401) {
        this.setState({ errorMessage: `Get Weather Error [ ${data.message} Please change the code of "WeatherApplication.jsx".]` });
      } else {
        this.setState({ errorMessage: `Get Weather Error [ ${data.message} ]` });
      }
    }).catch((e) => {
      this.setState({ errorMessage: `Get Weather Error [ ${e} ]` });
    });
  }
  render() {
    return (<div>
      <input ref={(input) => { this.inputCity = input; }} type="text" placeholder="Add City" />
      <input type="button" value="Get Current Weather" onClick={this.handleGetWeather} />
      <div style={{ color: '#D8000C' }}>{this.state.errorMessage}</div>
      {
        this.state.weather.city
          ? <div>City: {this.state.weather.city}, {this.state.weather.country}<br />Weather: {this.state.weather.weather}<img src={`${iconURL}${this.state.weather.icon}.png`} alt={this.state.weather.weather} width="24px" />, Temperature: {this.state.weather.temp}℃</div>
          : null
      }
    </div>
    );
  }
}

WeatherApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};