# vault-config.hcl

# Storage backend - using the file system for simplicity (adjust path as needed)
storage "file" {
  path = "D:\\Project\\vault\\data"
}

listener "tcp" {
  address     = "127.0.0.1:8200"
  tls_disable = true
}
api_addr = "http://127.0.0.1:8200"
cluster_addr = "https://127.0.0.1:8201"
ui = true
