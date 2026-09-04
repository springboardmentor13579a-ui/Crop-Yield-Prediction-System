-- YieldSense AI SQLite schema

CREATE TABLE crop_records (
	id INTEGER NOT NULL, 
	crop VARCHAR(120) NOT NULL, 
	crop_year INTEGER NOT NULL, 
	season VARCHAR(80) NOT NULL, 
	state VARCHAR(120) NOT NULL, 
	area FLOAT NOT NULL, 
	production FLOAT NOT NULL, 
	annual_rainfall FLOAT NOT NULL, 
	fertilizer FLOAT NOT NULL, 
	pesticide FLOAT NOT NULL, 
	yield FLOAT NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE farms (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	farm_name VARCHAR(120) NOT NULL, 
	state VARCHAR(120) NOT NULL, 
	district VARCHAR(120), 
	village VARCHAR(120), 
	area FLOAT, 
	primary_crop VARCHAR(120), 
	irrigation_type VARCHAR(80), 
	latitude FLOAT, 
	longitude FLOAT, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE forecasts (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	farm_id INTEGER, 
	crop VARCHAR(120) NOT NULL, 
	crop_year INTEGER NOT NULL, 
	season VARCHAR(80) NOT NULL, 
	state VARCHAR(120) NOT NULL, 
	area FLOAT NOT NULL, 
	annual_rainfall FLOAT NOT NULL, 
	fertilizer FLOAT NOT NULL, 
	pesticide FLOAT NOT NULL, 
	forecasted_yield FLOAT NOT NULL, 
	forecasted_production FLOAT, 
	historical_yield_median FLOAT, 
	historical_rainfall_median FLOAT, 
	historical_fertilizer_rate_median FLOAT, 
	historical_pesticide_rate_median FLOAT, 
	outside_historical_years BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(farm_id) REFERENCES farms (id) ON DELETE SET NULL
);

CREATE TABLE soil_records (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	farm_id INTEGER, 
	soil_type VARCHAR(80) NOT NULL, 
	ph FLOAT NOT NULL, 
	nitrogen FLOAT, 
	phosphorus FLOAT, 
	potassium FLOAT, 
	organic_carbon FLOAT, 
	moisture FLOAT, 
	notes TEXT, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(farm_id) REFERENCES farms (id) ON DELETE SET NULL
);

CREATE TABLE users (
	id INTEGER NOT NULL, 
	full_name VARCHAR(120) NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	phone VARCHAR(30), 
	state VARCHAR(120), 
	district VARCHAR(120), 
	role VARCHAR(20) NOT NULL, 
	password_hash VARCHAR(512) NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE weather_records (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	farm_id INTEGER, 
	location_name VARCHAR(180), 
	latitude FLOAT NOT NULL, 
	longitude FLOAT NOT NULL, 
	temperature FLOAT, 
	apparent_temperature FLOAT, 
	humidity FLOAT, 
	precipitation FLOAT, 
	wind_speed FLOAT, 
	soil_temperature FLOAT, 
	soil_moisture FLOAT, 
	weather_code INTEGER, 
	captured_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(farm_id) REFERENCES farms (id) ON DELETE SET NULL
);

