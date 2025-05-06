class Features {
  query: any;
  queryStr: any;

  constructor(query: any, queryStr: any) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    let query = {};
    const keywords = this.queryStr.keywords ?  this.queryStr.keywords.split(' ') : [];
    if (keywords.length > 0) {
      query = {
        $and: keywords.map((kw: string) => ({
          $or: [
            { title: { $regex: kw, $options: "i" } },
            { searchTags: { $regex: kw, $options: "i" } },
          ],
        })),
      };
    }

    if(this.queryStr.category){
      query = {
        category: {
          $regex: this.queryStr.category,
          $options: "i",
        }
      }
    }
    
    this.query = this.query.find({ ...query });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // removing some fields for category
    const removeFileds = ["keyword", "page", "limit", "category"];
    removeFileds.forEach((key) => delete queryCopy[key]);

    // fiter for price and rating
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resultPerPage: number) {
    const currentPage = Number(this.queryStr.page) || 1;

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }

  populate() {
    this.query = this.query.populate("user", "name avatar");
    return this;
  }

  select() {
    this.query = this.query.select("title pricing images ratings numOfRatings searchTags video");
    return this;
  }

}

export default Features;
