const webpack = require('webpack')

module.exports = {
	entry: `${__dirname}/client.js`,
	output: {
		path: `${__dirname}/static`,
		filename: 'bundle.js',
	},
	resolve: { extensions: ['.js', 'jsx'] },
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						plugins: ['syntax-jsx', 'inferno'],
						presets: ['stage-0', 'es2015'],
					},
				},
			},
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader', 'sass-loader'],
			}
		],
	},
	plugins: [
		new webpack.ProvidePlugin('Inferno', 'inferno'),
		new webpack.DefinePlugin('process.env.NODE_ENV', JSON.stringify(process.env.NODE_ENV)),
	],
	devtool: 'source-map',
	devServer: { proxy: { '*': { target: 'http://localhost:3000' } } },
}