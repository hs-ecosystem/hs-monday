import styled from 'styled-components'
import PropTypes from 'prop-types'

const Image = styled.img`
  width: 75px;
  height: 75px;
  margin-right: ${(p) => (p.noMarginRight ? undefined : '10px')};
  cursor: ${(p) => (p.onClick ? 'pointer' : null)};
`

const NoImage = styled.div`
  width: 75px;
  height: 75px;
  margin-right: ${(p) => (p.noMarginRight ? undefined : '10px')};
  background: grey;
  display: inline-flex;
`

/*
    Example:
    const artist = { url: 'https://something.com/image.png' }
    <StreamItemImage item={artist}

    Example:
    const url = 'https://something.com/image.png'
    <StreamItemImage url={url}
*/

const StreamItemImage = (props) => {
  const { url, item } = props
  return (
    <div>
      {url ? (
        <Image src={url} {...props} />
      ) : item ? (
        <Image src={item.url} {...props} />
      ) : (
        <NoImage {...props} />
      )}
    </div>
  )
}

StreamItemImage.propTypes = {
  item: PropTypes.shape({
    url: PropTypes.string,
  }),
  url: PropTypes.string,
}

export { StreamItemImage }
