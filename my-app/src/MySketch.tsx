import React from 'react';
import p5Types from "p5";
import Sketch from "react-p5";
import _ from "lodash";
import {Delaunay} from "d3-delaunay";
import {QuadTree, Box, Point, Circle} from 'js-quadtree';

function voronoi_relaxation(points:[number,number][], factor:number){

	function polygon_to_centroid(polygon:number[][]){
		let sliding_window_pairs = (arr:Array<any>)=>{
			return(_.zip(arr, arr.slice(1)).slice(0,-1))
		}
	
		const a = _.sum(sliding_window_pairs(polygon).map(pair=>{
			const xy = pair[0];
			const xy_next = pair[1];
	
			return xy[0]*xy_next[1] - xy_next[0]*xy[1];
		}))/2
	
		let centroid = sliding_window_pairs(polygon).map(pair=>{
			const xy = pair[0];
			const xy_next = pair[1];
	
			return [
				(xy[0]+xy_next[0])*(xy[0]*xy_next[1] - xy_next[0]*xy[1]),
				(xy[1]+xy_next[1])*(xy[0]*xy_next[1] - xy_next[0]*xy[1])
			]})
			.reduce((prev, current)=>[(prev[0]+current[0]), (prev[1]+current[1])])
			.map(val=>val/(6*a));
		
		return centroid;
	
	}

    //Construct voronoi partition around points

    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0,0,1,1])
    const polygon_vertex_pairs = Array.from(voronoi.cellPolygons());

    //Calculate centroids and apply force
    polygon_vertex_pairs.forEach(polygon=>{

        let vertex = points[polygon.index];
        let centroid = polygon_to_centroid(polygon);
        let delta = [centroid[0]-vertex[0],centroid[1]-vertex[1]];

        points[polygon.index] = [vertex[0]+delta[0]*factor,vertex[1]+delta[1]*factor];
    })
};

function barnes_hut_simulation(points:[number,number][], factor:number){
	const PRECISION = 10000;
    const RADIUS = PRECISION*0.5;
	const SOFTENING = 0.005;

	let qt = new QuadTree(new Box(0,0,PRECISION,PRECISION));

	points.forEach((p,i)=>{
        let [x,y] = p;
        qt.insert({x:Math.floor(x*PRECISION),y:Math.floor(y*PRECISION),data:i});
    })

	let points_clone = _.cloneDeep(points);

	const repelling_force = (p1:[number,number], p2:[number,number])=>{
		let delta = [p2[0] - p1[0], p2[1] - p1[1]]
        let dist = Math.sqrt(delta[0]**2 + delta[1]**2)

		let force:[number,number] = dist!==0?[
			(factor*Math.sign(-delta[0]))/Math.sqrt(dist**2 + SOFTENING**2),
			(factor*Math.sign(-delta[1]))/Math.sqrt(dist**2 + SOFTENING**2),
		]:[0,0];

		return force;
	}

	qt.getAllPoints().forEach(p=>{
		let point = points_clone[p.data];

		//Bounding forces
		//TODO: bbox as parameter

		const BOUNDING_FACTOR = 5;

		let bounding_force = [
			repelling_force(point,[0,point[1]]),
			repelling_force(point,[1,point[1]]), 
			repelling_force(point,[point[0],0]),
			repelling_force(point,[point[0],1]),
		].reduce((a,b)=>[a[0]+b[0],a[1]+b[1]]);

		points[p.data] = [points[p.data][0]+bounding_force[0]*BOUNDING_FACTOR, points[p.data][1]+bounding_force[1]*BOUNDING_FACTOR];

        //query nearby
        qt.query(new Circle(p.x,p.y,RADIUS)).forEach(n=>{
			let neighbour = points_clone[n.data];

            let force = repelling_force(point,neighbour);

            points[p.data] = [points[p.data][0]+force[0], points[p.data][1]+force[1]];
			
        })
    })

};


let points:[number,number][] = [];
for (let index = 0; index < 200; index++) {
    points.push([Math.random(),Math.random()]) 
};

let v_points = _.cloneDeep(points);
let bh_points = _.cloneDeep(points);

const SIZE = 500;

interface MySketchProps {
	//Your component props
}

const MySketch: React.FC<MySketchProps> = (props: MySketchProps) => {

	//See annotations in JS for more information
	const setup = (p5: p5Types, canvasParentRef: Element) => {
		p5.createCanvas(SIZE, SIZE).parent(canvasParentRef);
		p5.background(240);
		//p5.frameRate(1);

	};

	const draw = (p5: p5Types) => {
		p5.background(240,240,240);

		_.zip(v_points,points,bh_points).forEach(ps=>{
			let [v_p,p,bh_p] = ps;

			p5.strokeWeight(1);
			p5.stroke(0,0,0);
			p5.line(v_p![0]*SIZE,v_p![1]*SIZE,p![0]*SIZE,p![1]*SIZE);

			p5.strokeWeight(1);
			p5.stroke(0,0,0);
			p5.line(p![0]*SIZE,p![1]*SIZE,bh_p![0]*SIZE,bh_p![1]*SIZE);

			//Spawn location
			p5.strokeWeight(5)
			p5.stroke(0,0,200);
			p5.point(p![0]*SIZE,p![1]*SIZE);

			//Voronoi location
			p5.strokeWeight(7)
			p5.stroke(200,0,50);
			p5.point(v_p![0]*SIZE,v_p![1]*SIZE);

			//Barnes-hut location
			p5.strokeWeight(7)
			p5.stroke(20,200,50);
			p5.point(bh_p![0]*SIZE,bh_p![1]*SIZE);
			
		})

		voronoi_relaxation(v_points,0.1);
		barnes_hut_simulation(bh_points,0.00001);
	};

	const mouseClicked = (p5:p5Types)=>{
		//console.log(bh_points)
		
	};

	return <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked}/>;
};

export default MySketch;