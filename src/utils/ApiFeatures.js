export class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }
  paginate() {
    const PAGE_LIMIT = 3;
    let PAGE_NUMBER = this.queryString.page * 1 || 1;
    if (PAGE_NUMBER <= 0) PAGE_NUMBER = 1;
    const SKIP = (PAGE_NUMBER - 1) * PAGE_LIMIT;
    this.mongooseQuery.skip(SKIP).limit(PAGE_LIMIT);
    this.PAGE = PAGE_NUMBER;
    return this;
  }

  filter() {
    let filterObj = { ...this.queryString };
    let excludedQuery = ['page', 'sort', 'fields', 'keywords'];
    excludedQuery.forEach((ele) => {
      delete filterObj[ele];
    });
    filterObj = JSON.parse(
      JSON.stringify(filterObj).replace(
        /\b(gte|gt|lt|lte)\b/g,
        (match) => `$${match}`
      )
    );
    this.mongooseQuery.find(filterObj);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      let sortedBy = this.queryString.sort.split(',').join(' ');
      this.mongooseQuery.sort(sortedBy);
    }
    return this;
  }
  search() {
    if (this.queryString.keywords) {
      this.mongooseQuery.find({
        $or: [
          { title: { $regex: this.queryString.keywords, $options: 'i' } },
          { description: { $regex: this.queryString.keywords, $options: 'i' } },
          { name: { $regex: this.queryString.keywords, $options: 'i' } },
        ],
      });
    }
    return this;
  }
  fields() {
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(',').join(' ');
      this.mongooseQuery.select(fields);
    }
    return this;
  }
}
