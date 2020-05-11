/* eslint-disable react/destructuring-assignment */
/* eslint-disable import/extensions */
import React from 'react';
import { Label, Panel } from 'react-bootstrap';
import ProductTable from './ProductTable.jsx';
import ProductAdd from './ProductAdd.jsx';
import graphQLFetch from './graphQLFetch.js';
import Toast from './Toast.jsx';


export default class ProductList extends React.Component {
  constructor() {
    super();
    this.state = {
      products: [],
      toastVisible: false,
      toastMessage: ' ',
      toastType: 'info',
    };
    this.createProduct = this.createProduct.bind(this);
    this.deleteProduct = this.deleteProduct.bind(this);
    this.showSuccess = this.showSuccess.bind(this);
    this.showError = this.showError.bind(this);
    this.dismissToast = this.dismissToast.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query{
      productList
      { 
        id category name price image
        }
        productCount{count}
      }`;
    const data = await graphQLFetch(query);
    this.setState({ products: data.productList, productCount: data.productCount });
  }

  async createProduct(product) {
    const query = `mutation productAdd($product: productinputs!) {
      productAdd(product: $product) {
        id
      }
    }`;
    const data = await graphQLFetch(query, { product }, this.showError);
    if (data) {
      this.showSuccess('Added Product successfully.');
      this.loadData();
    }
  }

  async deleteProduct(index) {
    const query = `mutation productDelete($id: Int!) {
      productDelete(id: $id)
    }`;
    const { products } = this.state;
    const { id } = products[index];
    const data = await graphQLFetch(query, { id });
    const productdeleteinfo = data.productDelete;
    if (productdeleteinfo) {
      this.showSuccess(`Deleted Product Id ${id} successfully.`);
      this.loadData();
    }
  }

  showSuccess(message) {
    this.setState({
      toastVisible: true, toastMessage: message, toastType: 'success',
    });
  }

  showError(message) {
    this.setState({
      toastVisible: true, toastMessage: message, toastType: 'danger',
    });
  }

  dismissToast() {
    this.setState({ toastVisible: false });
  }

  render() {
    const { toastVisible, toastType, toastMessage } = this.state;
    const { productCount } = this.state;
    if (productCount == null) return null;
    const count = productCount.map(counts => (
      <span key={counts.count}>
        {' '}
        {counts.count}
      </span>
    ));
    return (
      <React.Fragment>
        <Label>
          Showing
          { count }
          {' '}
          available Products
          {' '}
        </Label>
        <hr />
        <ProductTable products={this.state.products} deleteProduct={this.deleteProduct} />
        <Panel>
          <Panel.Heading>Add a new product to inventory</Panel.Heading>
          <Panel.Body><ProductAdd createProduct={this.createProduct} /></Panel.Body>
        </Panel>
        <Toast
          showing={toastVisible}
          onDismiss={this.dismissToast}
          bsStyle={toastType}
        >
          {toastMessage}
        </Toast>
      </React.Fragment>
    );
  }
}
