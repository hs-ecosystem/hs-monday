import styled from 'styled-components'
// import { setItems } from '../data/actions/items'
// import { Dropdown } from '../Dropdown/Dropdown'
import { setItems, Dropdown } from '../../hs-comps'
import AddIcon from '@material-ui/icons/Add'
import Chip from '@material-ui/core/Chip'
import Avatar from '@material-ui/core/Avatar'
import camelCase from 'camelcase'

const Container = styled.div`
  display: flex;
  align-items: center;
`

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
`

const AddItemsText = styled.p`
  color: ${(p) => p.color};
  margin: 0;
  text-transform: capitalize;
`

const HorizontalSingleSelect = ({
  store,
  appName,
  itemName,
  items,
  selectedItem,
  noAvatar,
  color = 'grey',
  noAddLabel = false,
  label,
}) => {
  const itemLabel = label ? label : itemName
  const selectedItemsName = camelCase(`selected ${itemName}`)
  const handleAdd = (item) => {
    setItems({
      store,
      resource: selectedItemsName,
      items: item,
    })
    const newItems = items.filter((a) => a.id !== item.id)
    setItems({ store, resource: itemName, items: newItems })
  }
  const handleDelete = (item) => {
    const newItems = [item, ...items]
    setItems({
      store,
      resource: itemName,
      items: newItems,
    })
    setItems({
      store,
      resource: selectedItemsName,
      items: null,
    })
  }
  const middleItems =
    items &&
    items.map((a) => ({
      text: a.text,
      id: a.id,
      onClick: () => handleAdd(a),
    }))

  return (
    <Container>
      {selectedItem ? (
        <ItemContainer>
          <Chip
            avatar={!noAvatar ? <Avatar src={selectedItem.imgSrc} /> : null}
            label={selectedItem.text}
            onDelete={() => handleDelete(selectedItem)}
          />
        </ItemContainer>
      ) : (
        <AddItemsText color={color}>
          {!noAddLabel && 'Add'} {itemLabel}
        </AddItemsText>
      )}
      {!selectedItem && (
        <Dropdown
          appName={appName}
          dropdownButton={{ icon: <AddIcon /> }}
          firstItem={{ text: itemLabel }}
          middleItems={middleItems}
        />
      )}
    </Container>
  )
}

export { HorizontalSingleSelect }
