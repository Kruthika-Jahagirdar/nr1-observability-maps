/* eslint
no-console: 0,
*/

import { navigation } from 'nr1';
import { toast } from 'react-toastify';
import { cleanNodeId } from '../../lib/helper';

export const buildContextOptions = (
  mapData,
  rightClickType,
  rightClickedNodeId
) => {
  const contextOptions = [];

  if (mapData) {
    if (rightClickType === 'node' && mapData.nodeData[rightClickedNodeId]) {
      const ignoreEntityTypes = ['APM_EXTERNAL_SERVICE_ENTITY'];
      if (
        !ignoreEntityTypes.includes(
          mapData.nodeData[rightClickedNodeId].entityType
        ) &&
        mapData.nodeData[rightClickedNodeId].guid
      ) {
        contextOptions.push({
          name: 'View Entity',
          action: 'openStackedEntity',
          value: mapData.nodeData[rightClickedNodeId].guid
        });
      }

      if (
        mapData.nodeData[rightClickedNodeId].relationships &&
        mapData.nodeData[rightClickedNodeId].relationships.length > 0
      ) {
        contextOptions.push({
          name: 'View Connected Entities',
          action: 'viewConnectedEntities',
          view: 'connections'
        });
        contextOptions.push({
          name: 'Add Connected Services',
          action: 'addConnectedServices'
        });
      }

      if (mapData.nodeData[rightClickedNodeId].domain === 'APM') {
        contextOptions.push({
          name: 'View Distributed Traces',
          action: 'viewDistributedTraces'
        });
      }

      contextOptions.push({
        name: 'View Logs',
        action: 'viewLogs'
      });

      contextOptions.push({
        name: 'View Dashboard',
        action: 'viewDashboard'
      });
    } else if (rightClickType === 'link') {
      contextOptions.push({ name: 'Edit', action: 'editLink' });
    }
  }

  const ignoreNames = ['Select or create a map!', 'Add a node!'];
  if (rightClickType === 'node' && !ignoreNames.includes(rightClickedNodeId)) {
    contextOptions.unshift({ name: 'Edit', action: 'editNode' });
    contextOptions.push({ name: 'Delete', action: 'deleteNode' });
  }
  return contextOptions;
};

export const rightClick = (
  item,
  rightClickedNodeId,
  updateDataContextState,
  mapData,
  mapConfig
) => {
  toast.configure();
  switch (item.action) {
    case 'openStackedEntity':
      navigation.openStackedEntity(item.value);
      break;
    case 'viewConnectedEntities':
      updateDataContextState({ sidebarOpen: true, sidebarView: item.view });
      break;
    case 'addConnectedServices':
      // only support non infra entities
      mapData.nodeData[rightClickedNodeId].relationships.forEach(rs => {
        const sourceEntityType =
          (((rs || {}).source || {}).entity || {}).entityType || null;
        const targetEntityType =
          (((rs || {}).target || {}).entity || {}).entityType || null;

        if (
          rs.source.entity &&
          rs.target.entity &&
          rs.source.entity.name &&
          rs.target.entity.name &&
          rs.source.entity.name !== rs.target.entity.name &&
          sourceEntityType &&
          targetEntityType &&
          !sourceEntityType.includes('INFRA') &&
          !targetEntityType.includes('INFRA') &&
          !sourceEntityType.includes('WORKLOAD') &&
          !targetEntityType.includes('WORKLOAD')
        ) {
          // add node
          let selectedEntity = null;
          let alternateEntity = null;

          if (cleanNodeId(rightClickedNodeId) !== rs.source.entity.name) {
            selectedEntity = rs.source.entity;
            alternateEntity = rs.target.entity;
          } else if (
            cleanNodeId(rightClickedNodeId) !== rs.target.entity.name
          ) {
            selectedEntity = rs.target.entity;
            alternateEntity = rs.source.entity;
          }

          if (selectedEntity) {
            const selectedNodeName = selectedEntity.domain
              ? `${selectedEntity.name} [${selectedEntity.domain}]`
              : selectedEntity.name;

            if (selectedEntity.name && !mapConfig.nodeData[selectedNodeName]) {
              console.log('creating node', selectedNodeName);
              mapConfig.nodeData[selectedNodeName] = {
                name: selectedEntity.name,
                guid: selectedEntity.guid,
                entityType: selectedEntity.entityType
              };
            }

            // add alternate node if it does not exist
            const alternateNodeName = selectedEntity.domain
              ? `${selectedEntity.name} [${selectedEntity.domain}]`
              : selectedEntity.name;
            if (
              alternateEntity.name &&
              !mapConfig.nodeData[alternateNodeName]
            ) {
              console.log('creating node', alternateNodeName);
              mapConfig.nodeData[alternateNodeName] = {
                name: selectedEntity.name,
                guid: selectedEntity.guid,
                entityType: selectedEntity.entityType
              };
            }

            // add links
            const sourceName = rs.source.entity.domain
              ? `${rs.source.entity.name} [${rs.source.entity.domain}]`
              : rs.source.entity.name;

            const targetName = rs.target.entity.domain
              ? `${rs.target.entity.name} [${rs.target.entity.domain}]`
              : rs.target.entity.name;

            const linkId = `${sourceName}:::${targetName}`;
            console.log(`creating link ${linkId}`);

            if (!mapConfig.linkData[linkId]) {
              mapConfig.linkData[linkId] = {
                source: `${sourceName}`,
                target: `${targetName}`
              };
            }
          } else {
            console.log('unable to determine selected entity');
          }
        }
      });

      updateDataContextState({ mapConfig }, ['saveMap']);

      break;
    case 'viewDistributedTraces':
      const dt = {
        id: 'distributed-tracing-nerdlets.distributed-tracing-launcher',
        urlState: {
          query: {
            operator: 'AND',
            indexQuery: {
              conditionType: 'INDEX',
              operator: 'AND',
              conditions: []
            },
            spanQuery: {
              operator: 'AND',
              conditionSets: [
                {
                  conditionType: 'SPAN',
                  operator: 'AND',
                  conditions: [
                    {
                      attr: 'appName',
                      operator: 'EQ',
                      value: cleanNodeId(rightClickedNodeId)
                    }
                  ]
                }
              ]
            }
          }
        }
      };
      navigation.openStackedNerdlet(dt);
      break;
    case 'viewLogs':
      const logs = {
        id: 'logger.home',
        urlState: {
          query: `"${cleanNodeId(
            rightClickedNodeId
          )}" or service_name:"${cleanNodeId(rightClickedNodeId)}"`,
          accountId: mapData.nodeData[rightClickedNodeId].account.id || ''
        }
      };
      navigation.openStackedNerdlet(logs);
      break;
    case 'viewDashboard':
      const dash = mapConfig.nodeData[rightClickedNodeId].dashboard;
      if (dash === undefined) {
        toast.error(
          'Dashboard not configured. To add, go to Edit -> Dashboard',
          {
            autoClose: 5000,
            containerId: 'B'
          }
        );
      } else {
        navigation.openStackedEntity(dash);
      }
      break;
    case 'editNode':
      updateDataContextState({ editNodeOpen: true });
      break;
    case 'editLink':
      updateDataContextState({ editLinkOpen: true });
      break;
    case 'deleteNode':
      delete mapConfig.nodeData[rightClickedNodeId];
      Object.keys(mapConfig.linkData).forEach(link => {
        if (
          link.startsWith(`${rightClickedNodeId}:::`) ||
          link.endsWith(`:::${rightClickedNodeId}`)
        ) {
          delete mapConfig.linkData[link];
        }
      });
      updateDataContextState({ mapConfig }, ['saveMap']);
      break;
  }

  updateDataContextState({ showContextMenu: false });
};

export const tableMetrics = (selectedMap) => {
  let tableData = [{
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
  }];
  const map = selectedMap;
  console.log(map, "sel map form utils");
  let tblData='' ;
  if (map) {
    tableData.forEach((item, index) => {
      if (item.value.includes(map.value)) {
        //this.setState({ selectedTable: item });
        tblData=item;
      }
    });
  }
  console.log(tblData);
  return tblData;
};