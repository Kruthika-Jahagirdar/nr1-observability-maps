/* eslint
no-console: 0,
*/
import React from 'react';
import { Graph } from 'react-d3-graph';
import { Menu, Header, Divider, Button, GridRow, GridColumn, Grid } from 'semantic-ui-react';
import { DataConsumer } from '../../context/data';
import { buildContextOptions, rightClick } from './map-utils';

import MainChart from '../custom-nodes/main-chart';
import { setEntityDesign } from '../../lib/helper';
// graph event callbacks
// const onDoubleClickNode = nodeId => {
//   console.log(`Double clicked node ${nodeId}`);
// };

// const onMouseOverNode = nodeId => {
//   console.log(`Mouse over node ${nodeId}`);
// };

// const onMouseOutNode = nodeId => {
//   console.log(`Mouse out node ${nodeId}`);
// };

// const onMouseOverLink = (source, target) => {
//   console.log(`Mouse over in link between ${source} and ${target}`);
// };

// const onMouseOutLink = (source, target) => {
//   console.log(`Mouse out link between ${source} and ${target}`);
// };

// do not allow negative coordinates
const safeCoordinate = coordinate =>
  coordinate <= 0 ? Math.floor(Math.random() * 150) + 1 : coordinate;

export default class Map extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rightClickType: '',
      menuX: 0,
      menuY: 0,
      freezeNodes: false,
      rightClickedNodeId: null,
      isOpen: false,
      nodeData: '',
      chartData: '',
      chartArray: []
    };
    console.log(props, "props");
    this.onClickGraph = this.onClickGraph.bind(this);
    this.onNodePositionChange = this.onNodePositionChange.bind(this);
    this.onRightClickLink = this.onRightClickLink.bind(this);
    this.slide = React.createRef();
  }

  // resetNodesPositions = () => this.refs.graph.resetNodesPositions();
  // logRefs = () => console.log(this.refs);

  onNodePositionChange = async (
    nodeId,
    x,
    y,
    mapConfig,
    updateDataContextState
  ) => {
    // // perform a quick artifical update, before coordinates are saved to nerdstore
    // const { data } = this.state;
    // const indexToUpdate = data.nodes.findIndex(o => o.id === nodeId);
    // data.nodes[indexToUpdate].x = x;
    // data.nodes[indexToUpdate].y = y;

    const ignoreNames = ['Select or create a map!', 'Add a node!'];
    if (!ignoreNames.includes(nodeId)) {
      mapConfig.nodeData[nodeId].x = x;
      mapConfig.nodeData[nodeId].y = y;
      updateDataContextState({ mapConfig: { ...mapConfig } }, ['saveMap']);
    }

    console.log(
      `Node ${nodeId} moved to new position. New position is x= ${x} y= ${y}`
    );
  };

  onRightClickNode = (event, nodeId, mapConfig, updateDataContextState) => {
    console.log(`Right clicked node ${(event, nodeId)}`);
    if (mapConfig && mapConfig.nodeData && mapConfig.nodeData[nodeId]) {
      this.setState({
        rightClickedNodeId: nodeId,
        rightClickType: 'node',
        menuX: event.clientX,
        menuY: event.clientY - 75
      });
      updateDataContextState({
        sidebarOpen: false,
        selectedNode: nodeId,
        showContextMenu: true
      });
    }
  };

  onClickLink = (source, target) => {
    console.log(`Clicked link between ${source} and ${target}`);
  };

  onClickGraph = updateDataContextState => {
    console.log(`Clicked the graph background`);
    updateDataContextState({
      selectedNode: '',
      sidebarOpen: false,
      showContextMenu: false
    });
  };

  onClickNode = (nodeId, x, y, updateDataContextState) => {
    updateDataContextState({ showContextMenu: false });
    console.log(`onClickNode ${nodeId} ${x} ${y}`);

  };

  onRightClickLink = (
    event,
    source,
    target,
    mapConfig,
    updateDataContextState
  ) => {
    console.log(`Right clicked link between ${source} and ${target}`);
    const link = `${source}:::${target}`;
    if (mapConfig && mapConfig.linkData && mapConfig.linkData[link]) {
      this.setState({
        rightClickType: 'link',
        menuX: event.clientX,
        menuY: event.clientY - 75
      });
      updateDataContextState({
        sidebarOpen: false,
        selectedLink: link,
        showContextMenu: true
      });
    }
  };

  componentDidMount() {
    //  this.showSlides();
    setTimeout(() => {
      this.changeNodeStyle();
      // console.log(document.getElementById('graphid-graph-container-zoomable'), "graph container");
      // document.getElementById('graphid-graph-container-zoomable').setAttribute('transform', 'translate(180, 30.99999999999997) scale(0.6) !important');
      // console.log(document.getElementById('graphid-graph-container-zoomable').getAttribute('transform'), "graph container after update");
    }, 5000);
  }
  changeNodeStyle() {
    //change y position of svg text for nodes
    console.log(document.getElementsByClassName('node')[0], "svg node text inside render");
    if (document.getElementsByClassName('node')) {
      // document.getElementsByClassName('node')[0].children[1].setAttribute('dy','35')
      for (let i = 0; i < document.getElementsByClassName('node').length; i++) {
        document.getElementsByClassName('node')[i].children[1].setAttribute('dx', '40');
      }
    }

    console.log(document.getElementById('Custom Order [CUSTOM_NODE]'), "node by id")
  }
  showSlides() {
    console.log(this.slide, "map data", this.slide.current)
    let charts = [];
    if (this.slide.value) {
      for (let key in this.slide.value) {
        if (this.slide.value[key].mainChart) {
          charts.push(this.slide.value[key].mainChart);
        }
      }
      // this.setState({ chartArray: charts });
      console.log(charts, 'chart data');
    }
  }
  render() {
    const { d3MapConfig } = this.props;
    const {
      menuX,
      menuY,
      freezeNodes,
      rightClickedNodeId,
      rightClickType
    } = this.state;

    if (freezeNodes) {
      // d3MapConfig.staticGraph = true;
      // d3MapConfig.staticGraphWithDragAndDrop = false;
    } else {
      d3MapConfig.staticGraph = false;
      d3MapConfig.staticGraphWithDragAndDrop = true;
    }

    // disable right click
    document.addEventListener('contextmenu', event => event.preventDefault());

    // manipulate marker location
    // this is quite hacky, consider having these features part of core graph lib
    for (let i = 0; i < document.getElementsByTagName('marker').length; i++) {
      document.getElementsByTagName('marker')[i].setAttribute('refX', '25');
      document
        .getElementsByTagName('marker')
      [i].setAttribute('markerWidth', '2');
      document
        .getElementsByTagName('marker')
      [i].setAttribute('markerHeight', '2');
    }
    console.log(d3MapConfig, "map config");


    //code for slide show
    // console.log(document.getElementsByClassName('slides'), "slides");
    // let slideIndex = 0;
    // let i;
    // let slides = document.getElementsByClassName("slides");
    // if (slides) {
    //   for (i = 0; i < slides.length; i++) {
    //     slides[i].style.display = "none";
    //   }
    //   slideIndex++;
    //   if (slideIndex > slides.length) { slideIndex = 1 }

    //   slides[slideIndex - 1].style.display = "block";
    // }

    return (
      <DataConsumer>
        {({
          updateDataContextState,
          data,
          mapData,
          mapConfig,
          showContextMenu,
          hasError,
          err,
          errInfo,
          userIcons
        }) => {
          const contextOptions = buildContextOptions(
            mapData,
            rightClickType,
            rightClickedNodeId
          );
          const nodes = mapData.nodeData;

          this.slide.current = nodes;

          //change y position of svg text for nodes



          return (
            <>
              {' '}
              {showContextMenu && contextOptions.length > 0 ? (
                <div
                  style={{
                    backgroundColor: 'white',
                    position: 'absolute',
                    zIndex: 9999,
                    top: menuY + 14,
                    left: menuX + 14
                  }}
                >
                  <Menu vertical inverted style={{ borderRadius: '0px' }}>
                    {contextOptions.map((item, i) => {
                      return (
                        <Menu.Item
                          key={i}
                          link
                          onClick={() =>
                            rightClick(
                              item,
                              rightClickedNodeId,
                              updateDataContextState,
                              mapData,
                              mapConfig
                            )
                          }
                        >
                          <span
                            style={{
                              color: item.name === 'Delete' ? 'red' : 'white'
                            }}
                          >
                            {item.name}
                          </span>
                        </Menu.Item>
                      );
                    })}
                  </Menu>
                </div>
              ) : (
                ''
              )}
              {hasError ? (
                <div style={{ padding: '15px' }}>
                  <Header
                    as="h3"
                    content="Something went wrong :("
                    style={{ color: 'white' }}
                  />
                  <Button
                    color="blue"
                    content="Clear Error"
                    icon="info"
                    size="large"
                    onClick={
                      () => window.location.reload()
                      // updateDataContextState({
                      //   selectedMap: null,
                      //   hasError: false,
                      //   err: null,
                      //   errInfo: null,
                      //   mapConfig: { nodeData: {}, linkData: {} },
                      //   mapData: {
                      //     nodeData: {},
                      //     linkData: {}
                      //   }
                      // })
                    }
                  />
                  <Divider />

                  <Header
                    as="h5"
                    content="Error:"
                    style={{
                      color: 'white',
                      paddingBottom: '0px',
                      paddingTop: '0px'
                    }}
                  />
                  <textarea
                    style={{
                      color: 'white',
                      height: d3MapConfig.height / 6
                    }}
                    value={err}
                    readOnly
                  />

                  <Header
                    as="h5"
                    content="Error Info:"
                    style={{
                      color: 'white',
                      paddingBottom: '0px',
                      paddingTop: '0px'
                    }}
                  />
                  <textarea
                    style={{
                      color: 'white',
                      height: d3MapConfig.height / 6
                    }}
                    value={JSON.stringify(errInfo)}
                    readOnly
                  />
                  <Header
                    as="h5"
                    content="Map Config:"
                    color="white"
                    style={{
                      color: 'white',
                      paddingBottom: '0px',
                      paddingTop: '0px'
                    }}
                  />
                  <textarea
                    style={{ height: d3MapConfig.height / 2.5, color: 'white' }}
                    value={JSON.stringify(mapConfig)}
                    readOnly
                  />
                </div>
              ) : (<>
                <Graph
                  id="graphid" // id is mandatory, if no id is defined rd3g will throw an error
                  // ref="graph"
                  data={data}
                  config={d3MapConfig}
                  onClickNode={(n, x, y) =>
                    this.onClickNode(n, x, y, mapData)
                  }
                  onRightClickNode={(e, n) =>
                    this.onRightClickNode(
                      e,
                      n,
                      mapConfig,
                      updateDataContextState
                    )
                  }
                  onClickGraph={() => this.onClickGraph(updateDataContextState)}
                  onClickLink={this.onClickLink}
                  onRightClickLink={(e, s, t) =>
                    this.onRightClickLink(
                      e,
                      s,
                      t,
                      mapConfig,
                      updateDataContextState
                    )
                  }
                  // onMouseOverNode={onMouseOverNode}
                  // onMouseOutNode={onMouseOutNode}
                  // onMouseOverLink={onMouseOverLink}
                  // onMouseOutLink={onMouseOutLink}
                  onNodePositionChange={(nodeId, x, y) =>
                    this.onNodePositionChange(
                      nodeId,
                      safeCoordinate(x),
                      safeCoordinate(y),
                      mapConfig,
                      updateDataContextState
                    )
                  }
                />

              </>
              )}


            </>

          );
        }}
      </DataConsumer >
    );
  }
}
