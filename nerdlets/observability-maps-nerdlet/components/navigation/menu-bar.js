/* eslint 
no-console: 0
*/
import React from 'react';
import {
  Button, TableRow,
  TableHeaderCell,
  TableHeader,
  TableCell,
  TableBody,
  Table
} from 'semantic-ui-react';
import CreateMap from '../map/create';
import DeleteMap from '../map/delete';
import ExportMap from '../map/export';
import Select from 'react-select';
// import UserConfig from '../user-config';
import ManageNodes from '../node/manage';
import ManageLinks from '../link/manage';
import ImportMap from '../map/import';
import RefreshSelector from '../map/refresh';
import ManageIcons from '../icons/manage';
import MapSettings from '../map/settings';
import UserSettings from '../user/settings';
import { DataConsumer } from '../../context/data';

export default class MenuBar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isTable: false,
      tableData: [{
        "name": "MtC Metrics (last 24h)",
        "value": "Market-to-Cash",
        "data": [
          {
            "title": "# Sales Order",
            "value": 400
          },
          {
            "title": "# Deliveries",
            "value": 400
          }, {
            "title": "# Goods Issues",
            "value": 1000
          },
          {
            "title": "# Invoices",
            "value": 300
          }
        ]
      },
      {
        "name": "StP Metrics (last 24h)",
        "value": "Source-to-Pay---Direct",
        "data": [
          {
            "title": "# Sales Order",
            "value": 400
          },
          {
            "title": "# Deliveries",
            "value": 400
          }, {
            "title": "# Goods Issues",
            "value": 1000
          },
          {
            "title": "# Invoices",
            "value": 300
          }
        ]
      }],
      selectedTable: ''
    };
  }
  handleMapMenuChange = (
    selectedMap,
    availableMaps,
    updateDataContextState
  ) => {
    if (typeof selectedMap === 'string' || selectedMap instanceof String) {
      const map = availableMaps.filter(map => map.id === selectedMap);
      if (map.length === 1) {
        const selected = { value: map[0].id, label: map[0].id, type: 'user' };
        updateDataContextState({ selectedMap: selected }, ['loadMap']);
        console.log(`Map selected:`, selectedMap);
      }
    } else {
      updateDataContextState({ selectedMap }, ['loadMap']);
      console.log(`Map selected:`, selectedMap);
     
        this.setState({ isTable: true });
        console.log("show metrics", this.state.isTable);
        const tblData = this.state.tableData.forEach((item, index) => {
          if (item.value.includes(selectedMap.value)) {
            this.setState({ selectedTable: item });
            return console.log(item);
          }
        });

      
    }
  };

  componentDidMount() {
    console.log("mounting component");
  }
  render() {
    const { isTable, selectedTable } = this.state;
    return (
      <DataConsumer>
        {({
          accounts,
          selectedMap,
          userMaps,
          accountMaps,
          updateDataContextState,
          timelineOpen,
          storageLocation,
          dataFetcher,
          selectMap,
          vizHideMenu
        }) => {
          const { isWidget } = this.props;
          const storageOptions = accounts.map(acc => ({
            key: acc.id,
            label: acc.name,
            value: acc.id,
            type: 'account'
          }));

          storageOptions.sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          });

          storageOptions.unshift({
            key: 'User',
            label: 'User (Personal)',
            value: 'user',
            type: 'user'
          });

          let availableMaps = [];

          if (accountMaps && storageLocation.type === 'account') {
            accountMaps = accountMaps.map(map => ({
              value: map.id,
              label: (map.id || '').replaceAll('+', ' ').replaceAll('-', ' '),
              type: 'account'
            }));
            availableMaps = [...accountMaps];
          }

          if (userMaps && storageLocation.type === 'user') {
            userMaps = userMaps.map(map => ({
              value: map.id,
              label: map.id.replaceAll('+', ' ').replaceAll('-', ' '),
              type: 'user'
            }));
            availableMaps = [...userMaps];
          }

          if (selectedMap)
            selectedMap.label = selectedMap.label
              .replaceAll('+', ' ')
              .replaceAll('-', ' ');

          if (vizHideMenu) {
            return '';
          }

          return (
            <div>
              <div className="utility-bar">
                {!isWidget && (
                  <>
                    <div className="react-select-input-group">
                      <label>Map Storage</label>
                      <Select
                        options={storageOptions}
                        onChange={async d => {
                          await updateDataContextState({
                            storageLocation: d
                          });
                          selectMap(null, true);
                          dataFetcher(['accountMaps']);
                        }}
                        value={storageLocation}
                        classNamePrefix="react-select"
                      />
                    </div>
                    <div className="react-select-input-group">
                      <label>Available Maps</label>
                      <Select
                        options={availableMaps}
                        onChange={map =>
                          this.handleMapMenuChange(
                            map,
                            availableMaps,
                            updateDataContextState
                          )
                        }
                        value={selectedMap}
                        classNamePrefix="react-select"
                      />
                    </div>

                    {selectedMap ? <DeleteMap /> : ''}

                    <CreateMap />

                    <ImportMap />

                    {selectedMap ? <ExportMap /> : ''}
                  </>
                )}

                <div className="flex-push" />

                {selectedMap ? <ManageNodes /> : ''}
                {selectedMap ? <ManageLinks /> : ''}

                {/* <UserConfig /> */}

                <ManageIcons />

                {selectedMap ? <MapSettings /> : ''}

                {selectedMap ? (
                  <Button
                    icon={timelineOpen ? 'clock' : 'clock outline'}
                    content="Timeline"
                    className="filter-button"
                    style={{ height: '35px', width: '70px' }}
                    onClick={() =>
                      updateDataContextState({ timelineOpen: !timelineOpen })
                    }
                  />
                ) : (
                  ''
                )}

                <UserSettings />

                <RefreshSelector />
                {isTable ? (<div className="floating-panel">
                  <Table celled color='transparent' key='transparent' singleLine>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell colSpan='3'>{selectedTable.name}</TableHeaderCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {selectedTable.data.map((item) => {
                        return (
                          <TableRow>
                            <TableCell>
                              {item.title}
                            </TableCell>
                            <TableCell><b>{item.value}</b></TableCell>

                          </TableRow>
                        );
                      }
                      )}

                    </TableBody>
                  </Table>
                </div>) : (<></>)}
              </div>

            </div>
          );
        }}

      </DataConsumer>

    );
  }
}
