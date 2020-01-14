export const defaultPaginator = {
  page: 1,
  page_size: 20,
  total_pages: 0,
  count: 0,
  visible_range: []
};

const updatePaginatorTotalResults = (data) => {
  if (data && data.count) {
    const count = parseInt(data.count, 10);
    if (!isNaN(count)) {
      return count;
    }
  }
  return 0;
};

const computeTotalPages = (pageSize, totalResults) => {
  return (pageSize < totalResults) ? Math.ceil(totalResults / pageSize) : 1;
};

const computeVisibleRange = (paginator) => {
  let start = 1;
  let end = paginator.count;
  if (!paginator.count) {
    start = 0;
  } else {
    if (paginator.page !== 1) {
      start = (paginator.page - 1) * paginator.page_size + 1;
    }
    if (paginator.page !== paginator.total_pages) {
      end = start + (paginator.count < paginator.page_size ? paginator.count : paginator.page_size) - 1;
    }
  }

  return [start, end];
};

export const getPaginator = (currentPaginator, data) => {
  // init paginator
  const paginator = Object.assign({}, currentPaginator);
  paginator.count = updatePaginatorTotalResults(data);
  paginator.total_pages = computeTotalPages(paginator.page_size, paginator.count);
  paginator.visible_range = computeVisibleRange(paginator);
  return paginator;
};

