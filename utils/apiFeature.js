
class APIFeature {
  constructor(queryInstance, queryString) {
    this.queryInstance = queryInstance;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryString };
    const excludeField = ["sort", "fields", "page", "limit"];
    excludeField.map((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`);
    this.queryInstance.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.queryInstance = this.queryInstance.sort(sortBy);
    } else {
      this.queryInstance = this.queryInstance.sort("-createdAt");
    }

    return this;
  }

  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.queryInstance = this.queryInstance.select(fields);
    } else {
      this.queryInstance = this.queryInstance.select("-__v"); //__v creat by mongo we can exclude by default.
    }

    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit; // previous-page * limit

    this.queryInstance = this.queryInstance.skip(skip).limit(limit);

    return this;
  }
}


module.exports = APIFeature;