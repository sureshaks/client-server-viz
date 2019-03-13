from flask import Flask
from flask_restful import Resource, Api
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_curve
from sklearn.metrics import roc_auc_score
import pandas as pd
import numpy as np
from flask.ext.cors import CORS

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
api = Api(app)

class ROC(Resource):
	"""
	preprocessing - how to preprocess the data (std or min_max)
	c - Regularization constraint
	"""
	def get(self, preprocessing="std", c=5):
		# you need to preprocess the data according to user preferences (only fit preprocessing on train data)
		# fit the model on the training set
		# predict probabilities on test set
		response = {}
		if preprocessing != "std" and preprocessing != "min_max" and (c is not float or c is not int):
			response["status"] = "error"
			response["message"] = "incorrect parameters"
			response["data"] = []
			return response
		
		if preprocessing == "std":
			scaler = MinMaxScaler()
			scaler.fit(X_train)
			X_train_scaled = scaler.transform(X_train)
			X_test_scaled = scaler.transform(X_test)
		else:
			scaler = StandardScaler()
			scaler.fit(X_train)
			X_train_scaled = scaler.transform(X_train)
			X_test_scaled = scaler.transform(X_test)
			
			
		model = LogisticRegression(C=c).fit(X_train_scaled, y_train)
		
		scores = [el[1] for el in model.predict_proba(X_test_scaled)]
		
		
		fpr, tpr, thresholds = roc_curve(y_test, scores, pos_label=1)
		
		data = {}
		roc_points = []
		for i in range(0, len(thresholds)):
			roc_points.append({"fpr": str(fpr[i]), "tpr": str(tpr[i]), "threshold": str(thresholds[i])})
			
		data["roc_points"] = roc_points
		data["auc_score"] = roc_auc_score(y_test, scores)
		return {
			"status": "success",
			"message": "model ran successfully",
			"data": data
		}

# Here you need to add the ROC resource, ex: api.add_resource(HelloWorld, '/')
# for examples see 
# https://flask-restful.readthedocs.io/en/latest/quickstart.html#a-minimal-api

api.add_resource(ROC,"/<string:preprocessing>/<float:c>")

if __name__ == '__main__':
	# load data
	df = pd.read_csv('data/transfusion.data')
	xDf = df.loc[:, df.columns != 'Donated']
	y = df['Donated']
	# get random numbers to split into train and test
	np.random.seed(1)
	r = np.random.rand(len(df))
	# split into train test
	X_train = xDf[r < 0.8]
	X_test = xDf[r >= 0.8]
	y_train = y[r < 0.8]
	y_test = y[r >= 0.8]
	app.run(debug=True)