/* eslint-disable max-classes-per-file */

export interface IPaginatorResponse {
  data: Array<any>
  meta: {
    currentPage: Number
    totalCount: Number
    itemsPerPage: Number
    previousPage?: Number
    nextPage?: Number
  }
}

enum QueryType {
  Find,
  Aggregate
}
class Pagination {
  _quryType: QueryType

  _model: any

  _query: any

  _countQuery: any

  _limit: number

  _page: number

  constructor(model: any) {
    this._model = model
    this._query = null
    this._countQuery = null
    this._quryType = QueryType.Find
    this._limit = 15
    this._page = 0
  }

  find(condition) {
    this._query = this._model.find(condition)
    this._countQuery = this._model
      .find(condition)
      .countDocuments()
      .then(count => count)
    this._quryType = QueryType.Find
    return this
  }

  aggregate(condition) {
    this._query = this._model.aggregate(condition)
    this._countQuery = this._model
      .aggregate([...condition, { $count: 'count' }])
      .then(count => count[0].count)
    this._quryType = QueryType.Aggregate
    return this
  }

  option({ page = 0, limit = 15, offset = 0 }) {
    this._limit = limit
    this._page = page
    const _offset = page * limit + offset

    if (this._quryType === QueryType.Find) {
      this._query.skip(_offset).limit(limit)
    } else {
      this._query._pipeline.push({ $skip: _offset }, { $limit: limit })
    }
    return this
  }

  sort(sort: object = { _id: 1 }) {
    if (this._quryType === QueryType.Find) {
      this._query.sort(sort)
    } else {
      this._query._pipeline.push({ $sort: sort })
    }

    return this
  }

  async result(): Promise<IPaginatorResponse> {
    const count = await this._countQuery

    const lastPage = Math.ceil(count / this._limit)

    return {
      data: await this._query,
      meta: {
        currentPage: this._page,
        totalCount: count,
        itemsPerPage: this._limit,
        previousPage: this._page > 0 ? this._page - 1 : 0,
        nextPage: this._page < lastPage - 1 ? this._page + 1 : 0
      }
    }
  }
}

export default class Paginator {
  static model(model: any) {
    return new Pagination(model)
  }
}
