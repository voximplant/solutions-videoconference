.PHONY: default
default:
	echo use make me | get-user-info && \
	echo 'make me url=http://localhost:1337 token=foobar' && \
	echo 'make get-vox-token url=http://localhost:1337 name=test token=foobar'

.PHONY: me
me:
	curl -X POST ${url}/users/me --header "authorization: Bearer ${token}" --header "Content-Type: application/json" --data '{"key": "${key}"}'

.PHONY: get-user-info
get-vox-token:
	curl -X POST ${url}/get-vox-token --header "authorization: Bearer ${token}" --header "Content-Type: application/json" --data '{"one_time_key": "${key}"}'
