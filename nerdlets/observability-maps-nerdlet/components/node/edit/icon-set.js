import React from 'react';
import { Header, Form } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';
import { getAccountCollection, getUserCollection } from '../../../lib/utils';

export default class IconSet extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      iconSet: [],
      selected: '',
      location: ''
    };
  }

  // componentDidMount() {
  //   setTimeout(() => {
  //     this.getIconSet(this.state.location);
  //     console.log(this.state.location, "location")
  //   }, 3000);
  // }

  saveNrql = async (updateDataContextState, mapConfig, nodeId, value) => {
    console.log(value, "sel val");
    this.setState({ selected: value });
    mapConfig.nodeData[nodeId].iconSet = value;
    console.log(mapConfig, "mapconfig");
    await updateDataContextState({ mapConfig }, ['saveMap']);
  };

  async getIconSet(storageLocation, userIcons) {
    if (storageLocation.type == 'user') {
      userIcons = await getUserCollection('ObservabilityIcons');
      // this.setState({ iconSet: userIcons });
    } else {
      userIcons = await getAccountCollection(
        storageLocation.value,
        'ObservabilityIcons'
      );
      // this.setState({ iconSet: icons });
    }
    console.log(userIcons, "on load icon set");
  }

  render() {
    const { iconSet, selected } = this.state;
    return (
      <DataConsumer>
        {({ mapConfig, selectedNode, updateDataContextState, storageLocation, userIcons }) => {
          this.setState({ location: storageLocation });
          let filterUserIcons, userIconSelection;
          this.getIconSet(storageLocation, userIcons);
          console.log(userIcons, "inside render");
         

            filterUserIcons = userIcons.filter((val, i) => userIcons.indexOf(val) === i);
            userIconSelection = filterUserIcons.map((set, i) =>
            ({
              key: set.id,
              value: set.id,
              text: set.id
            }));

            //initial dropdown value
            userIconSelection.unshift({
              key: 'default',
              text: 'Default',
              value: 'default'
            });
      




          const tempState = {
            selected: ''
          };

          if (mapConfig.nodeData[selectedNode].iconSet) {
            tempState.selected = mapConfig.nodeData[selectedNode].iconSet;
          }
          console.log(tempState.selected, "temp", filterUserIcons);
          return (
            <>
              <Header as="h4">Select an Icon Set</Header>

              <Form.Group inline widths="16">
                <Form.Select
                  width="16"
                  style={{ display: 'inline', width: '100%' }}
                  search
                  options={userIconSelection}
                  placeholder="Select Icon Set"
                  value={
                    this.state.selected === ''
                      ? tempState.selected
                      : this.state.selected
                  }
                  onChange={(e, d) =>
                    this.saveNrql(
                      updateDataContextState,
                      mapConfig,
                      selectedNode,
                      d.value
                    )
                  }

                />
              </Form.Group>
              <br />
            </>
          );
        }}
      </DataConsumer>
    );
  }
}
