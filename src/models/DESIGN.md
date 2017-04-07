if (login && network) {
	1. query API
	2. store API result locally
} else {
	1. store locally  
	(we might have to create temporary IDs for task creation)
	(client validation should be identical to server, we do not need
		server-side validation errors hours after task creation)
}

Q: Why separate API and storage?
A: Only client code needs to know about login/network status. This means decouple storage and network, and let the client decide which should be done.

The client continually attempts to sync. If offline, nothing happens. For simplicity, there is not a special sync for when login or network occurs. Otherwise, far too much duplicated effort. Perhaps login / network triggers a sync, but it does not have a special API endpoint devoted to it.

TODO - revisit all of these assumptions
