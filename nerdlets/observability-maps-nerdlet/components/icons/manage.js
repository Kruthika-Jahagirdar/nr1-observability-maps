import React from 'react';
import { Modal, Button, Form, Label } from 'semantic-ui-react';
import {
  writeUserDocument,
  deleteUserDocument,
  deleteAccountDocument,
  writeAccountDocument,
  getAccountCollection,
  getUserCollection
} from '../../lib/utils';
import { DataConsumer } from '../../context/data';

const iconCollection = 'ObservabilityIcons';

const isValidUrl = string => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export default class ManageIcons extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selected: 'new',
      name: '',
      green: '',
      orange: '',
      red: '',
      iconSet: [],
      location: ''
    };
    this.writeIconSet = this.writeIconSet.bind(this);
    this.handleIconSetChange = this.handleIconSetChange.bind(this);
    this.getIconSet = this.getIconSet.bind(this);
  }
  //use effect

  componentDidMount() {
    setTimeout(() => {
      this.getIconSet(this.state.location);
      console.log(this.state.location, "location")
    }, 3000);
  }

  componentDidUpdate() {
    this.getIconSet(this.state.location);
  }
  writeIconSet(dataFetcher, storageLocation) {
    //use condition to save icon settings to User/Account type respectively.
    const { name, green, orange, red, selected } = this.state;
    const documentId = selected === 'new' || name !== '' ? name : selected;

    if (storageLocation.type === 'user') {
      writeUserDocument(iconCollection, documentId, { green, orange, red });
    } else if (storageLocation.type === 'account') {
      writeAccountDocument(
        storageLocation.value,
        iconCollection, documentId, { green, orange, red }
      );
    }
    dataFetcher(['userIcons']);
    this.handleIconSetChange(null);
  }

  deleteIconSet(selected, dataFetcher, storageLocation) {

    if (storageLocation.type === 'user') {
      deleteUserDocument(iconCollection, selected);
    } else {
      deleteAccountDocument(
        storageLocation.value,
        iconCollection,
        selected
      );
    }
    dataFetcher(['userIcons']);
    this.handleIconSetChange(null);
  }

  handleIconSetChange(value, userIcons, storageLocation) {
    // console.log(storageLocation);
    this.setState({ selected: value });
    let iconsArr;
    if (!storageLocation || storageLocation.type === 'user') {
      iconsArr = userIcons;
    }
    else {
      iconsArr = this.state.iconSet;
    }
    if (value === 'new' || !value) {
      this.setState({
        name: '',
        green: '',
        orange: '',
        red: ''
      });
    } else {
      for (let i = 0; i < iconsArr.length; i++) {
        if (iconsArr[i].id === value) {
          this.setState({
            name: iconsArr[i].id,
            green: iconsArr[i].document.green,
            orange: iconsArr[i].document.orange,
            red: iconsArr[i].document.red
          });
          break;
        }
      }
    }
  }

  async getIconSet(storageLocation) {
    if (storageLocation.type == 'user') {
      let userIcons = await getUserCollection('ObservabilityIcons');
      this.setState({ iconSet: userIcons });

    } else {
      let icons = await getAccountCollection(
        storageLocation.value,
        'ObservabilityIcons'
      );
      this.setState({ iconSet: icons });

    }
    console.log(this.state.iconSet, "from click event");
  }

  render() {
    const { selected, name, green, orange, red, iconSet } = this.state;
    return (
      <DataConsumer>
        {({ userIcons, updateDataContextState, dataFetcher, storageLocation }) => {
          let filterUserIcons, options;
          console.log(userIcons,"user icons in render");
          this.setState({ location: storageLocation });
          if (storageLocation.type === 'user') {
            filterUserIcons = iconSet.filter((val, i) => iconSet.indexOf(val) === i);
            options = filterUserIcons.map((set, i) =>
            ({
              key: i,
              text: set.id.replaceAll('+', ' ').replaceAll('-', ' '),
              value: set.id,
              data: set.document
            }));
          }
          else {

            filterUserIcons = iconSet;
            options = filterUserIcons.map((set, i) =>
            ({
              key: i,
              text: set.id.replaceAll('+', ' ').replaceAll('-', ' '),
              value: set.id,
              data: set.document
            }));
          }
          options.unshift({ key: 'new', text: 'New Icon Set', value: 'new' });

          return (
            <Modal
              closeIcon
              size="big"
              onUnmount={() => updateDataContextState({ closeCharts: false })}
              onMount={() => updateDataContextState({ closeCharts: true })}
              trigger={
                <Button icon="edit" content="Icons" className="filter-button" style={{ height: '35px', width: '60px' }} />
              }
            >
              <Modal.Header>Manage Icons</Modal.Header>
              <Modal.Content>
                <Form>
                  <Form.Group inline widths="16">
                    <Form.Select
                      width="10"
                      style={{
                        display: 'inline',
                        width: '100%',
                        position: ''
                      }}
                      search
                      fluid
                      options={options}
                      placeholder="Select Icon Set"
                      value={selected}
                      onChange={(e, d) =>
                        this.handleIconSetChange(d.value, userIcons, storageLocation)
                      }
                    // onClick={() => {
                    //   this.getIconSet(storageLocation, userIcons);
                    // }}
                    />
                    <Form.Button
                      width="3"
                      style={{ display: 'inline', width: '100%' }}
                      control={Button}
                      positive
                      disabled={
                        name === '' &&
                        green === '' &&
                        orange === '' &&
                        red === ''
                      }
                      content={selected === 'new' ? 'Clear' : 'Create New'}
                      onClick={() =>
                        this.setState({
                          selected: 'new',
                          name: '',
                          green: '',
                          orange: '',
                          red: ''
                        })
                      }
                    />
                    <Form.Button
                      width="3"
                      style={{ display: 'inline', width: '100%' }}
                      control={Button}
                      negative
                      disabled={selected === '' || selected === 'new'}
                      content="Delete"
                      onClick={() => this.deleteIconSet(selected, dataFetcher, storageLocation)}
                    />
                  </Form.Group>
                </Form>

                <br />
                <Form.Group widths="16">
                  <Form.Input
                    width={16}
                    fluid
                    label="Name"
                    placeholder="Icon Set Name"
                    value={name.replaceAll('+', ' ').replaceAll('-', ' ')}
                    onChange={e => this.setState({ name: e.target.value })}
                  />
                  <Label
                    style={{
                      display:
                        (selected === 'new' && name === '') ||
                        (selected === '' && name === '' ? '' : 'none')
                    }}
                    color="red"
                    pointing
                  >
                    Please select an existing icon set to update or enter a name
                  </Label>
                  <br />
                  <Form.Input
                    width={16}
                    fluid
                    label="Healthy Icon"
                    placeholder="http://somewebsite.com/someHealthyIcon.png"
                    value={green}
                    onChange={e => this.setState({ green: e.target.value })}
                  />
                  <Label
                    style={{ display: isValidUrl(green) ? 'none' : '' }}
                    color="red"
                    pointing
                  >
                    Please enter a valid URL
                  </Label>
                  <br />
                  <Form.Input
                    width={16}
                    fluid
                    label="Warning Icon"
                    placeholder="http://somewebsite.com/someWarningIcon.png"
                    value={orange}
                    onChange={e => this.setState({ orange: e.target.value })}
                  />
                  <Label
                    style={{ display: isValidUrl(orange) ? 'none' : '' }}
                    color="red"
                    pointing
                  >
                    Please enter a valid URL
                  </Label>
                  <br />
                  <Form.Input
                    width={16}
                    fluid
                    label="Critical Icon"
                    placeholder="http://somewebsite.com/someCriticalIcon.png"
                    value={red}
                    onChange={e => this.setState({ red: e.target.value })}
                  />
                  <Label
                    style={{ display: isValidUrl(red) ? 'none' : '' }}
                    color="red"
                    pointing
                  >
                    Please enter a valid URL
                  </Label>
                  <br />
                </Form.Group>
              </Modal.Content>
              <Modal.Actions>
                <Button
                  style={{ float: 'right' }}
                  positive
                  disabled={
                    (selected === 'new' && name === '') ||
                    (selected === '' && name === '') ||
                    !isValidUrl(green)
                  }
                  onClick={() => this.writeIconSet(dataFetcher, storageLocation)}
                >
                  Save
                </Button>
                <br /> <br />
              </Modal.Actions>
            </Modal>
          );
        }}
      </DataConsumer>
    );
  }
}
