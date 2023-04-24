import controller from './controller'
import ResolverBase from '../../utils/resolverBase'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getComments: resolverBase.query.index,
    getComment: resolverBase.query.get,
    getCommentsCount: resolverBase.query.count
  },
  Mutation: {
    createComment: resolverBase.mutationIfUserIdEqualsTo('sender').create,
    updateComment: resolverBase.mutationIfUserIdEqualsTo('sender').update,
    deleteComment: resolverBase.mutationIfUserIdEqualsTo('sender').delete
  }
}

export default resolver
