// generate svg
var width = 400;
var height = 400;
var padding = 25;

var margin = {
	top: 50,
	left: 50,
	bottom: 50,
	right: 50
};


var loadResults = function(preprocessing, c) {

	d3.json("http://localhost:5000/" + preprocessing +"/" + c).then(function(response) {
		if(response["status"] == "error") {
		// print error modal here
		return
		}

		// define the line
		var valueline = d3.line()
				  .x(function(d) { return xScale(d.fpr); })
				  .y(function(d) { return yScale(d.tpr); });

		var svg = d3.select("svg")
            		.attr("width", width)
            		.attr("height", height);



		// scale
		var xScale = d3.scaleLinear().domain([0, 1]).range([margin.left, width-margin.right]);
		var yScale = d3.scaleLinear().domain([0, 1]).range([height-margin.bottom, margin.top]);


		// define the line
		var valueline = d3.line()
    		.x(function(d) { return xScale(d.fpr); })
    		.y(function(d) { return yScale(d.tpr); });


		// axes
		var xAxis = svg.append("g")
               .attr("transform", `translate(0, ${height-margin.bottom})`)
               .call(d3.axisBottom().scale(xScale));

        var yAxis = svg.append("g")
           .attr("transform",`translate(${margin.left}, 0)`)
           .call(d3.axisLeft().scale(yScale));


                // now add titles to the axes
        svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (padding/2) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("True positive Rate (tpr)");

        svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (width/2) +","+(height-(padding/3))+")")  // centre below axis
            .text("False positive Rate (fpr)");

        svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(response["data"]["roc_points"]));

        svg.append("line")
           .style("stroke", "black")  
           .style("stroke-dasharray", (5,5))
           .attr("x1", xScale(0.0))
           .attr("y1", yScale(0.0))
           .attr("x2", xScale(1.0))
           .attr("y2", yScale(1.0));

        $("#auc").html(parseFloat(response["data"]["auc_score"]).toFixed(3));
	});
}

loadResults("std", "1.0");

var updateData = function(preprocessing, c) {

	d3.json("http://localhost:5000/" + preprocessing +"/" + c).then(function(response) {
		console.log(response);
		var svg = d3.select("svg").transition();

		// scale
		var xScale = d3.scaleLinear().domain([0, 1]).range([margin.left, width-margin.right]);
		var yScale = d3.scaleLinear().domain([0, 1]).range([height-margin.bottom, margin.top]);

		// define the line
		var valueline = d3.line()
				  .x(function(d) { return xScale(d.fpr); })
				  .y(function(d) { return yScale(d.tpr); });

		svg.select(".line")
		   .duration(750)
           .attr("d", valueline(response["data"]["roc_points"]));		

        $("#auc").html(parseFloat(response["data"]["auc_score"]).toFixed(3));

	});

}

var ROC = function() {
	if ($("#preprocessing")[0].checkValidity() && $("#c")[0].checkValidity()) {
		console.log("Updating...");
		preprocessing = $("#preprocessing").val();
		c = parseFloat($("#c").val()).toFixed(3);
		updateData(preprocessing, c);
	}
}
