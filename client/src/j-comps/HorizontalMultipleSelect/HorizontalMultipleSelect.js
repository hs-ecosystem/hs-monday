import styled from 'styled-components'
import { setItems } from '../data/actions/items'
import { Dropdown } from '../Dropdown/Dropdown'
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

const HorizontalMultipleSelect = ({
  store,
  appName,
  itemName,
  items,
  selectedItems,
  noAvatar,
  color = 'grey',
  noAddLabel = false,
  label,
}) => {
  const itemLabel = label ? label : itemName
  const selectedItemsName = camelCase(`selected ${itemName}`)
  const handleAdd = (item) => {
    const newSelectedItems = [...selectedItems, item]
    const newItems = items.filter((a) => a.id !== item.id)
    setItems({
      store,
      resource: selectedItemsName,
      items: newSelectedItems,
    })
    setItems({ store, resource: itemName, items: newItems })
  }
  const handleDelete = (item) => {
    const newItems = [item, ...items]
    setItems({
      store,
      resource: itemName,
      items: newItems,
    })
    const newSelectedItems = selectedItems.filter((a) => a.id !== item.id)
    setItems({
      store,
      resource: selectedItemsName,
      items: newSelectedItems,
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
      {selectedItems && selectedItems.length ? (
        selectedItems.map((a, i) => (
          <ItemContainer key={i}>
            <Chip
              avatar={!noAvatar ? <Avatar src={a.imgSrc} /> : null}
              label={a.text}
              onDelete={() => handleDelete(a)}
            />
          </ItemContainer>
        ))
      ) : (
        <AddItemsText color={color}>
          {!noAddLabel && 'Add'} {itemLabel}
        </AddItemsText>
      )}
      <Dropdown
        appName={appName}
        dropdownButton={{ icon: <AddIcon /> }}
        firstItem={{ text: itemLabel }}
        middleItems={middleItems}
      />
    </Container>
  )
}

export { HorizontalMultipleSelect }
