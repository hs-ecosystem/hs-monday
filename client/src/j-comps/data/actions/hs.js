import { store } from '../../..'
import { getParameterByName } from '../../../utils/vendor'
import { setItems } from './items'

export const setMemberId = () => {
  const paramMemberId = getParameterByName('uid')
  const items = paramMemberId ? paramMemberId : undefined
  setItems({ store, resource: 'memberId', items })
}
