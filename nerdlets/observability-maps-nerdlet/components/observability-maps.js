import React from 'react';
import { Grid } from 'semantic-ui-react';
import MenuBar from './navigation/menu-bar';
import Map from './map/map';
import NodeHandler from './custom-nodes/handler';
import LinkHandler from './custom-links/handler';
import Sidebar from './sidebar/sidebar';
import EditNode from './node/edit/edit-node';
import EditLink from './link/edit/edit-link';
import { cleanNodeId } from '../lib/helper';
import Timeline from './timeline/timeline';
import { DataConsumer } from '../context/data';
import { Card, CardBody, HeadingText } from 'nr1';

export default class ObservabilityMaps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpen: false
    };
  }
  componentDidMount() {
    // setTimeout(() => {
    //   this.changeNodeStyle();

    // }, 5000);
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
  render() {
    const { sidebarOpen } = this.state;
    const { isWidget, vizConfig } = this.props;
    const graphWidth = sidebarOpen
      ? (this.props.width / 3) * 6
      : this.props.width;
    // const graphWidth='100vw';
    const nodeSize = 600; // increasing this will not adjust the icon sizing, it will increase the svg area

    // the graph configuration, you only need to pass down properties
    // that you want to override, otherwise default ones will be used
    console.log(this.props, "props");
    const d3MapConfig = {
      initialZoom: vizConfig?.initialZoom || 0.5,
      minZoom:0.5,
      maxZoom:2.5,
      staticGraph: false,
      staticGraphWithDragAndDrop: true,
      d3: {
        linkLength: 400
      },
      nodeHighlightBehavior: false, // if this is set to true reset positions doesn't work
      node: {
        color: 'lightgreen',
        size: nodeSize,
        highlightStrokeColor: 'blue',
        fontSize: 18,
        fontWeight: 'bold',
        highlightFontSize: 16,
        labelPosition: 'right',
        labelProperty: node => cleanNodeId(node.customLabel || node.id),
        fontColor: '#000',
        viewGenerator: node => <NodeHandler node={node} nodeSize={nodeSize} />
      },
      link: {
        highlightColor: 'lightblue',
        type: 'CURVE_SMOOTH',
        renderLabel: true,
        labelProperty: link => <LinkHandler link={link} />,
        fontColor: '#000',
        fontSize: 24,
        fontWeight: 'bold',
        markerHeight: 2,
        color: '#205527',
        strokeWidth:2
      },
    //  directed: true,
      // height: this.props.height - 60,
      height: '90vh',
      width: graphWidth
    };


    return (
      <DataConsumer>
        {({
          mapConfig,
          userMaps,
          accountMaps,
          vizMapName,
          vizMapStorage,
          vizAccountId,
          userIcons
        }) => {
          console.log(userIcons, "main maps icons");
          console.log(accountMaps, "acc maps");
          const errors = [];

          d3MapConfig.link.type =
            mapConfig?.settings?.linkType || 'STRAIGHT';

          d3MapConfig.staticGraph =
            (mapConfig?.settings?.staticGraph || false) === 'true';

          if (isWidget) {
            if (!vizMapStorage) {
              errors.push('Map storage not selected');
            }

            if (vizMapStorage === 'user') {
              if (
                !userMaps.find(
                  map =>
                    map.id.replaceAll('+', ' ') === vizMapName ||
                    map.id.replaceAll('-', ' ') === vizMapName
                )
              ) {
                errors.push(`User map: ${vizMapName} not found`);
              }
            } else if (vizMapStorage === 'account') {
              if (!vizAccountId) {
                errors.push('Account not selected');
              } else if (
                !accountMaps.find(
                  map =>
                    map.id.replaceAll('+', ' ') === vizMapName ||
                    map.id.replaceAll('-', ' ') === vizMapName
                )
              ) {
                errors.push(`Account map: ${vizMapName} not found`);
              }
            }
          }

          const mainGridStyle = {
            height: '100%',
            backgroundColor: 'black',
            marginTop: '0px'
          };

          // dynamically add map settings
          if (mapConfig.settings) {
            Object.keys(mapConfig.settings).forEach(key => {
              if (key.startsWith('background')) {
                mainGridStyle[key] = mapConfig.settings[key];
              }
            });
          }

          return (
            <div style={{ overflowY: 'hidden', overflowX: 'hidden', height: '100%' }}>
              {errors.length > 0 &&
                EmptyState(
                  errors,
                  vizMapStorage === 'user' ? userMaps : accountMaps,
                  vizMapStorage
                )}
              <MenuBar isWidget={isWidget} />

              <Grid columns={16} style={mainGridStyle}>
                <Grid.Row style={{ paddingTop: '0px' }}>
                  <Grid.Column width={16}>
                    <Map d3MapConfig={d3MapConfig} graphWidth={graphWidth} />
                  </Grid.Column>
                </Grid.Row>

                <Sidebar height={this.props.height - 60} />
                <Timeline height={this.props.height - 60} />
              </Grid>

              <EditNode />
              <EditLink />
            </div>
          );
        }}
      </DataConsumer>
    );
  }
}

const EmptyState = (errors, maps, mapStorage) => (
  <Card className="EmptyState">
    <CardBody className="EmptyState-cardBody">
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.SMALL]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Create your Observability Map in the standard application before setting
        the custom visualization widget.
      </HeadingText>
      <br />
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.SMALL]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Please amend any errors and supply the base configuration...
      </HeadingText>
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.SMALL]}
        type={HeadingText.TYPE.HEADING_4}
      >
        When this message clears your configuration is ready to be added
      </HeadingText>
      <div>
        {errors.map((error, i) => {
          return (
            <HeadingText
              key={i}
              spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
              type={HeadingText.TYPE.HEADING_4}
            >
              {error}
            </HeadingText>
          );
        })}
      </div>

      <br />
      {mapStorage && (
        <>
          <HeadingText
            spacingType={[HeadingText.SPACING_TYPE.LARGE]}
            type={HeadingText.TYPE.HEADING_3}
          >
            {`Available ${mapStorage} maps`}
          </HeadingText>
          <div>
            {(maps || []).map((map, i) => {
              return (
                <HeadingText
                  key={i}
                  spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
                  type={HeadingText.TYPE.HEADING_4}
                >
                  {map.id.replaceAll('+', ' ').replaceAll('-', ' ')}
                </HeadingText>
              );
            })}
          </div>
        </>
      )}
    </CardBody>
  </Card>
);
